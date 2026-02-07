const path = require('path');

module.exports = function (options, webpack) {
  return {
    ...options,
    resolve: {
      ...options.resolve,
      alias: {
        '@vcafe/shared-interfaces': path.resolve(
          __dirname,
          '../shared-interfaces/src/index.ts',
        ),
      },
    },
  };
};
