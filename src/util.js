const matter = require('gray-matter');
const axios = require('axios');
const http = require('https');
const tar = require('tar');
const Promise = require('bluebird');
const fs = Promise.promisifyAll(require('fs'));

const nunjucks = require('./lib/nunjucks');

const { pathFromRoot } = require('./app/constants');

const mkdir = (path) => fs.mkdirAsync(path, { recursive: true });

const dirExistsAndNotEmpty = (path) => fs.readdirAsync(path)
  .then((contents) => contents.length > 0)
  .catch((err) => {
    if (err.code === 'ENOENT') {
      return false;
    }
    throw err;
  });

const getDependency = (name, remote, version) => {
  const path = pathFromRoot('dependencies', name, version, name);
  return dirExistsAndNotEmpty(path)
    .then((exists) => {
      if (exists) {
        return path;
      }
      return mkdir(path)
        .then(() => new Promise((resolve, reject) => {
          http.get(remote, (response) => {
            const { statusCode } = response;
            if (statusCode === 200) {
              return response
                .on('error', (err) => reject(err))
                .pipe(tar.x(
                  {
                    strip: 1,
                    C: path,
                  },
                ))
                .on('error', (err) => reject(err))
                .on('end', () => resolve(path));
            } if (statusCode === 302) {
              // TODO: avoid infinite loops
              return getDependency(name, response.headers.location, version)
                .then((dependencyPath) => resolve(dependencyPath))
                .catch((err) => reject(err));
            }
            const message = `Failed to load ${remote} status code was ${statusCode}`;
            // eslint-disable-next-line no-console
            console.error(message);
            return reject(new Error(message));
          });
        }));
    });
};

const getComponentIdentifier = (org, component) => component.replace(/([A-Z])/g, (g) => `-${g[0].toLowerCase()}`).replace('govuk-', '').replace('hmrc-', '');
const getComponentSignature = (org, component) => org + component.replace(/^[a-z]/, (g) => `${g[0].toUpperCase()}`).replace(/(-[a-z])/g, (g) => `${g[1].toUpperCase()}`);

const getDirectories = (source) => fs.readdirAsync(source, { withFileTypes: true })
  .then((files) => files
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name));

const getDataFromFile = (file, paths) => fs.readFileAsync(file, 'utf8').then((contents) => {
  const nj = matter(contents).content;
  const html = nunjucks(paths).renderString(nj).trim();
  return {
    html,
    nunjucks: nj.trim(),
  };
});

const getNpmDependency = (dependency, version) => getDependency(
  dependency,
  `https://registry.npmjs.org/${dependency}/-/${dependency}-${version}.tgz`,
  version,
);

const getLatestSha = (() => {
  const fifteenMinutesInMillis = 1000 * 60 * 15;
  const cache = {};
  const getCacheKey = (repo, branch) => `${repo}:::${branch}`;
  const addToCache = (key, result) => {
    cache[key] = result;
    setTimeout(() => {
      delete cache[key];
    }, fifteenMinutesInMillis);
  };
  return async (repo, branch = 'master') => {
    const cacheKey = getCacheKey(repo, branch);
    if (cache[cacheKey]) {
      return cache[cacheKey];
    }
    const token = process.env.TOKEN;
    const headers = token ? { headers: { Authorization: `token ${token}` } } : undefined;
    const { data: { sha } } = await axios.get(`https://api.github.com/repos/${repo}/commits/${branch}`, headers);
    addToCache(cacheKey, sha);
    return sha;
  };
})();

const getOrgDetails = (org, version) => ({
  govuk: {
    code: 'govuk',
    label: 'govuk-frontend',
    githubUrl: `https://github.com/alphagov/govuk-frontend/tarball/v${version}`,
    componentDir: 'src/govuk/components',
    minimumSupported: 3,
  },
  hmrc: {
    code: 'hmrc',
    label: 'hmrc-frontend',
    githubUrl: `https://github.com/hmrc/hmrc-frontend/tarball/v${version}`,
    componentDir: 'src/components',
    dependencies: ['govuk-frontend'],
    minimumSupported: 1,
  },
})[org];

const loadJsonFile = (filePath) => fs.readFileAsync(filePath).then(JSON.parse);

const getSubDependencies = (dependencyPath, dependencies) => Promise.all(
  dependencies.map((dependency) => loadJsonFile(`${dependencyPath}/package.json`).then((packageContents) => {
    const version = packageContents.dependencies[dependency];
    const trimmedVersion = version
      .replace('v', '')
      .replace('^', '')
      .replace('~', '');
    return getNpmDependency(dependency, trimmedVersion);
  })),
);

const respondWithError = (res) => (err) => {
  if (err) {
    // eslint-disable-next-line no-console
    console.error(err.message);
    // eslint-disable-next-line no-console
    console.error(err.stack);
    res.status(500).send(err);
  } else {
    // eslint-disable-next-line no-console
    console.error('failed but no error provided');
    res.status(500).send('An error occurred');
  }
};

const joinWithCurrentUrl = (req, path) => `${req.originalUrl.replace(/\/+$/, '')}/${path}`;

const versionIsCompatible = (version, org) => parseFloat(version) >= org.minimumSupported;

const getConfiguredNunjucksForOrganisation = (org, version) => getNpmDependency(org.label, version)
  .then((path) => getSubDependencies(path, org.dependencies || []).then((dependencyPaths) => [path, `${path}/views/layouts`, ...dependencyPaths]))
  .then((nunjucksPaths) => nunjucks(nunjucksPaths));

const renderComponent = (org, component, params, nunjucksRenderer) => {
  const preparedParams = JSON.stringify(params || {}, null, 2);
  const nunjucksString = `{% from '${org}/components/${getComponentIdentifier(org, component)}/macro.njk' import ${component} %}{{${component}(${preparedParams})}}`;

  return nunjucksRenderer.renderString(nunjucksString);
};

module.exports = {
  getComponentIdentifier,
  getComponentSignature,
  getDataFromFile,
  getDependency,
  getDirectories,
  getNpmDependency,
  getLatestSha,
  getOrgDetails,
  getSubDependencies,
  respondWithError,
  getConfiguredNunjucksForOrganisation,
  versionIsCompatible,
  renderComponent,
  joinWithCurrentUrl,
};
