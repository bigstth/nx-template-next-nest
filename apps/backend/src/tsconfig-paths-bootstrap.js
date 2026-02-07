const tsConfigPaths = require('tsconfig-paths');
const tsConfig = require('../tsconfig.json');

const baseUrl = '../'; // relative to src directory
tsConfigPaths.register({
  baseUrl,
  paths: tsConfig.compilerOptions.paths,
});
