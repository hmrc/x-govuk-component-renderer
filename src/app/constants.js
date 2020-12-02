const path = require('path');

const pathFromRoot = (...parts) => path.join(__dirname, '..', ...parts);

module.exports = {
  pathFromRoot,
  readMe: path.resolve('README.md'),
  substitutionMap: {
    input: 'text-input',
  },
};
