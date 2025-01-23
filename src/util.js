const matter = require('gray-matter');
const axios = require('axios');
const http = require('https');
const tar = require('tar');
const Promise = require('bluebird');
const fs = Promise.promisifyAll(require('fs'));

const nunjucks = require('./lib/nunjucks');

const { pathFromRoot } = require('./app/constants');
const { OrgDetails, VersionSpecifics } = require('./model');

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

const registry = process.env.NPM_CONFIG_REGISTRY || 'https://registry.npmjs.org/';

const getNpmDependency = (dependency, version) => getDependency(
  dependency,
  `${registry}/${dependency}/-/${dependency}-${version}.tgz`,
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
  return async (repo, branch = 'main') => {
    const cacheKey = getCacheKey(repo, branch);
    if (cache[cacheKey]) {
      return cache[cacheKey];
    }
    const token = process.env.TOKEN;
    const headers = token ? { headers: { Authorization: `token ${token}` } } : undefined;
    const url = `https://api.github.com/repos/${repo}/commits/${branch}`;
    const { data: { sha } } = await axios.get(url, headers);
    addToCache(cacheKey, sha);
    return sha;
  };
})();

const getOrgDetails = (org, version) => ({
  govuk: new OrgDetails(
    'govuk',
    'govuk-frontend',
    `https://github.com/alphagov/govuk-frontend/tarball/v${version}`,
    3,
    [
      new VersionSpecifics(
        5,
        'packages/govuk-frontend/src/govuk/components',
        'dist/',
        (example) => (example.options),
      ),
      new VersionSpecifics(
        3,
        'src/govuk/components',
        '',
        (example) => (example.data),
      ),
    ],
  ),
  hmrc: new OrgDetails(
    'hmrc',
    'hmrc-frontend',
    `https://github.com/hmrc/hmrc-frontend/tarball/v${version}`,
    1,
    [
      new VersionSpecifics(
        1,
        'src/components',
        '',
        (example) => (example.data),
      ),
    ],
    ['govuk-frontend'],
  ),
})[org];

const extractOrgAndVersion = (dependencyPath) => {
  const parts = dependencyPath.split('/');
  const orgFrontend = parts.findIndex((part) => part.endsWith('-frontend'));
  const org = parts[orgFrontend].split('-')[0];
  const version = parts[orgFrontend + 1];
  return { org, version };
};

const addDistributionPaths = (paths) => {
  const distributionPaths = paths
    .filter((path) => path.endsWith('-frontend'))
    .map((path) => {
      const { org, version } = extractOrgAndVersion(path);
      const orgDetails = getOrgDetails(org, version);
      const versionSpecifics = orgDetails.getVersionSpecifics(version);
      return versionSpecifics ? `${path}/${versionSpecifics.distDir}` : path;
    });
  return [...paths, ...distributionPaths];
};

const getDataFromFile = (file, paths) => fs.readFileAsync(file, 'utf8').then((contents) => {
  const nj = matter(contents).content;
  const allPaths = addDistributionPaths(paths);
  const html = nunjucks(allPaths).renderString(nj).trim();
  return {
    html,
    nunjucks: nj.trim(),
  };
});

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

const getConfiguredNunjucksForOrganisation = (org, version) => getNpmDependency(org.label, version)
  .then((path) => getSubDependencies(path, org.dependencies || []).then((dependencyPaths) => [path, `${path}/views/layouts`, ...dependencyPaths]))
  .then((nunjucksPaths) => {
    const allPaths = addDistributionPaths(nunjucksPaths);
    return nunjucks(allPaths);
  });

const renderComponent = (orgDetails, version, component, params, nunjucksRenderer) => {
  const preparedParams = JSON.stringify(params || {}, null, 2);
  const org = orgDetails.code;
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
  renderComponent,
  joinWithCurrentUrl,
};
