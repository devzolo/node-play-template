const tsConfig = require('./tsconfig.json');

function getModuleResolverAlias() {
  return Object.entries(tsConfig?.compilerOptions?.paths).reduce((obj, keyPair) => {
    const key = keyPair?.[0]?.replace(/\/\*/g, '');
    const pair = keyPair?.[1]?.[0]?.replace(/\/\*/g, '');
    if (key) return { ...obj, [key]: pair };
    return obj;
  }, {});
}

module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        targets: {
          node: '14.17.3',
        },
      },
    ],
    '@babel/preset-typescript',
  ],
  plugins: [
    [
      'module-resolver',
      {
        alias: getModuleResolverAlias(),
      },
    ],
  ],
  ignore: ['**/*.spec.ts', '**/*.test.ts'],
};
