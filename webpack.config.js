const path = require('path');
const nodeExternals = require('webpack-node-externals');
const NodemonPlugin = require('nodemon-webpack-plugin');
const CopyWebpackConfig = require('copy-webpack-plugin');
const ProgressPlugin = require('progress-webpack-plugin');
const { DefinePlugin } = require('webpack');
const dotenv = require('dotenv');

const commonSettings = name => ({
  watch: true,
  watchOptions: {
    ignored: /node_modules\/(?!@anupheaus).*/,
  },
  output: {
    path: path.resolve(__dirname, './dist'),
  },
  module: {
    rules: [{
      test: /\.tsx?$/,
      loader: 'ts-loader',
      options: {
        onlyCompileBundledFiles: true,
        compilerOptions: {
          noEmit: false,
        },
      },
    }],
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
    alias: {
      '@anupheaus/common': path.join(__dirname, '../common/src'),
    },
  },
  plugins: [
    new ProgressPlugin({ identifier: name }),
    new DefinePlugin({
      'CONFIG': JSON.stringify(dotenv.config({ path: path.resolve(__dirname, '.env') }).parsed),
    }),
  ],
  stats: {
    assets: false,
    builtAt: true,
    cached: false,
    cachedAssets: false,
    children: false,
    chunks: false,
    chunkGroups: false,
    chunkModules: false,
    chunkOrigins: false,
    colors: true,
    depth: false,
    entrypoints: false,
    env: false,
    errors: true,
    errorDetails: true,
    hash: false,
    logging: 'error',
    modules: false,
    outputPath: false,
    performance: true,
    providedExports: false,
    publicPath: false,
    reasons: false,
    source: false,
    timings: true,
    usedExports: false,
    version: false,
    warnings: false,
  },
});

module.exports = (env, argv) => {
  const isDev = argv.mode === 'development';
  const startMode = env.startMode === 'library' ? 'library' : env.startMode === 'test' ? 'test' : 'both';
  const librarySettings = commonSettings('library', isDev);
  const testSettings = commonSettings('test', isDev);

  const config = [

    (startMode === 'library' || startMode === 'both' ? {
      ...librarySettings,
      name: 'library',
      entry: {
        library: './src/index.ts',
      },
      externalsPresets: { node: true },
      target: 'node',
      externals: [
        nodeExternals({
          allowlist: [
            '@anupheaus/common',
          ],
        }),
      ],
      plugins: [
        ...librarySettings.plugins,
      ],
    } : undefined),

    (startMode === 'test' || startMode === 'both' ? {
      ...testSettings,
      name: 'test',
      entry: {
        test: './test-server/index.ts',
      },
      externalsPresets: { node: true },
      target: 'node',
      externals: [
        nodeExternals({
          allowlist: [
            '@anupheaus/common',
          ],
        }),
      ],
      plugins: [
        ...testSettings.plugins,
        ...(isDev ? [new NodemonPlugin({
          watch: [
            path.resolve(__dirname, './dist/library.js'),
            path.resolve(__dirname, './dist/test.js'),
          ],
          ext: 'js,yaml',
        })] : []),
        new CopyWebpackConfig({
          patterns: [
            { from: './test-server/views', to: './views' },
            { from: './test-server/static', to: '.' },
          ],
        }),
      ],
    } : undefined),

  ].filter(v => v != null);

  return config;
};