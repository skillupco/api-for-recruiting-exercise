module.exports = ({
  webpack: config => ({
    ...config,
    entry: {
      main: ['./src/entry.ts'],
    },
    resolve: {
      extensions: ['.ts', '.js', '.json'],
    },
    module: {
      rules: [...config.module.rules, {
        test: /\.ts$/,
        // loader: 'swc-loader',
        loader: 'awesome-typescript-loader',
      }],
    },
  }),
});
