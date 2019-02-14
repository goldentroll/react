
const webpack = require('webpack')
const path = require('path')
const merge = require('webpack-merge')
const webpackConfigBase = require('./webpack.base.config')
const Copy = require('copy-webpack-plugin')
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CleanWebpackPlugin = require('clean-webpack-plugin')
const ParallelUglifyPlugin = require('webpack-parallel-uglify-plugin')
const AutoDllPlugin = require('autodll-webpack-plugin');

function resolve(relatedPath) {
  return path.join(__dirname, relatedPath)
}

const webpackConfigProd = {
  output: {
    publicPath: './',
  },
  plugins: [
    // 定义环境变量为开发环境
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('production'),
      IS_DEVELOPMETN: false,
    }),
    // 将打包后的资源注入到html文件内    
    new HtmlWebpackPlugin({
      // inject: true, // will inject the main bundle to index.html
      template: resolve('../app/index.html'),
      mapConfig:'http://192.168.0.1/map_config.js'
    }),
    /* webpack自带压缩代码*/
    // new webpack.optimize.UglifyJsPlugin({ minimize: true }),
    /* 多核压缩代码 */
    new ParallelUglifyPlugin({
      cacheDir: '.cache/',
      uglifyJS:{
        output: {
          comments: false
        },
        compress: {
          warnings: false
        }
      }
    }),
    // 分析代码
    new BundleAnalyzerPlugin({ analyzerMode: 'static' }),
    // new Copy([
    //   { from: './app/images', to: './images' },
    // ]),
    new CleanWebpackPlugin(['dist'],{
      root: path.join(__dirname, '../'),
      verbose:false,
      // exclude:['img']//不删除img静态资源
    }),
    new AutoDllPlugin({
      inject: true, // will inject the DLL bundle to index.html
      debug: true,
      filename: '[name].1.0.js',
      path: './dll',
      entry: {
        dll: [
          'react',
          'react-dom',
          'react-router',
          'babel'
        ]
      },
      plugins: [
        new ParallelUglifyPlugin({
          cacheDir: '.cache/',
          uglifyJS:{
            output: {
              comments: false
            },
            compress: {
              warnings: false
            }
          }
        }),
      ],
    })
  ],
}

module.exports = merge(webpackConfigBase, webpackConfigProd)
