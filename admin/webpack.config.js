const path = require('path');

const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const webpack = require('webpack');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const WorkerPlugin = require('worker-plugin');
const autoprefixer = require('autoprefixer');

const isProduction = process.env['NODE_ENV'] === 'production';
const src = path.join(__dirname, 'src');

let environment = 'production';
if (
  !(
    isProduction &&
    process.env.CIRCLE_BRANCH &&
    (process.env.CIRCLE_BRANCH.indexOf('master') !== -1 || process.env.CIRCLE_BRANCH.indexOf('beta') !== -1)
  )
) {
  environment = 'development';
}

const config = {
  devServer: {
    disableHostCheck: true,
  },
  entry: path.join(src, 'main.ts'),
  output: {
    path: path.join(__dirname, 'www'),
    filename: '[name][hash].js',
    chunkFilename: '[name][hash].js',
  },
  resolve: {
    // Add `.ts` and `.tsx` as a resolvable extension.
    extensions: ['.ts', '.tsx', '.js'],
    modules: [path.resolve('node_modules')],
  },
  module: {
    rules: [
      // all files with a `.ts` or `.tsx` extension will be handled by `ts-loader`
      {
        test: /\.tsx?$/,
        loaders: ['ts-loader'],
      },
      {
        test: /\.scss$/,
        use: [
          isProduction ? MiniCssExtractPlugin.loader : 'style-loader', // creates style nodes from JS strings
          {
            loader: 'css-loader',
            options: {
              modules: {
                localIdentName: isProduction ? '' : '[local]' + '[hash:base64:5]',
              },
            },
          },
          {
            loader: 'postcss-loader',
            options: {
              plugins: [autoprefixer()],
              sourceMap: true,
            },
          },
          'sass-loader',
        ],
        include: /module\.scss$/,
      },
      {
        test: /\.scss$/,
        use: [
          isProduction ? MiniCssExtractPlugin.loader : 'style-loader', // creates style nodes from JS strings
          'css-loader',
          {
            loader: 'postcss-loader',
            options: {
              plugins: [autoprefixer()],
              sourceMap: true,
            },
          },
          'sass-loader',
        ],
        exclude: /module\.scss$/,
      },
      {
        test: /\.css$/,
        use: [
          isProduction ? MiniCssExtractPlugin.loader : 'style-loader', // creates style nodes from JS strings
          'css-loader',
          {
            loader: 'postcss-loader',
            options: {
              plugins: [autoprefixer()],
              sourceMap: true,
            },
          },
        ],
      },
      {
        test: /\.(otf|ttf|eot|svg|gif|jpe?g|png)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        loader: 'file-loader',
        options: {
          name(file) {
            return file.replace(path.join(__dirname, 'src', path.sep), '').split(path.sep).join('/');
          },
        },
      },
    ],
  },
  plugins: [
    new CleanWebpackPlugin(),
    new WorkerPlugin({
      globalObject: false,
    }),
    new webpack.DefinePlugin({
      GC_PRODUCTION: isProduction,
      BUILD_NUM: JSON.stringify(process.env.CIRCLE_BUILD_NUM),
      BRANCH: JSON.stringify(process.env.CIRCLE_BRANCH),
      ENVIRONMENT: JSON.stringify(environment),
    }),
    new MiniCssExtractPlugin({
      // Options similar to the same options in webpackOptions.output
      // both options are optional
      filename: '[name][hash].css',
      chunkFilename: '[id][hash].css',
    }),
    new OptimizeCssAssetsPlugin(),
    new HtmlWebpackPlugin({
      template: 'src/index.html',
    }),
    new CopyWebpackPlugin([
      {
        from: 'src/assets',
        to: 'assets',
      },
    ]),
  ],
};

if (!isProduction) {
  config.devtool = 'inline-source-map';
}

module.exports = config;
