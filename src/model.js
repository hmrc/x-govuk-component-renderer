// eslint-disable-next-line max-classes-per-file
const majorVersion = (v) => parseInt(v.split('.')[0], 10);

const versionIsCompatible = (version, org) => majorVersion(version) >= org.minimumSupported;

class VersionSpecifics {
  constructor(fromVersion, srcDir, distDir, exampleData) {
    this.srcDir = srcDir;
    this.distDir = distDir;
    this.exampleData = exampleData;
    this.fromVersion = fromVersion;
  }
}

class OrgDetails {
  constructor(code, label, githubUrl, minimumSupported, versionSpecifics, dependencies = []) {
    this.code = code;
    this.label = label;
    this.githubUrl = githubUrl;
    this.dependencies = dependencies;
    this.minimumSupported = minimumSupported;
    this.versionSpecifics = versionSpecifics;
  }

  getVersionSpecifics(version) {
    return this.versionSpecifics
      .find((versionDirs) => versionDirs.fromVersion <= majorVersion(version));
  }
}

module.exports = {
  OrgDetails,
  VersionSpecifics,
  versionIsCompatible,
};
