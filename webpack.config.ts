// tslint:disable:no-console

import * as webpack from 'webpack'
import * as path from 'path'
import * as fs from 'fs'
import * as crypto from 'crypto'

import PostCompile = require('post-compile-webpack-plugin')

const _ = require('lodash')

const common = {
  mode: 'development',
  devtool: false,
  optimization: {
    flagIncludedChunks: true,
    usedExports: true,
    minimize: false,
    concatenateModules: false,
    emitOnErrors: false,
    moduleIds: 'named',
    chunkIds: 'named',
    // runtimeChunk: false,
  },

  resolve: {
    extensions: ['.ts', '.js'],
    // https://github.com/webpack/webpack/pull/8460/commits/a68426e9255edcce7822480b78416837617ab065
    fallback: {
      fs: false,
      assert: require.resolve('assert'),
      util: require.resolve('util'),
    },
    alias: {
      'path': path.join(__dirname, 'setup/shims/path.js')
    },
  },

  // node: { fs: 'empty' },
  resolveLoader: {
    alias: {
      'pegjs-loader': 'zotero-plugin/loader/pegjs',
      // 'json-jsesc-loader': 'zotero-plugin/loader/json',
      'bibertool-loader': path.join(__dirname, './setup/loaders/bibertool.ts'),
    },
  },
  module: {
    rules: [
      { test: /\.pegjs$/, use: [ 'pegjs-loader' ] },
      // { test: /\.json$/, type: 'javascript/auto', use: [ 'json-jsesc-loader' ] }, // https://github.com/webpack/webpack/issues/6572
      { test: /\.bibertool/, use: [ 'bibertool-loader' ] },
      { test: /\.ts$/, exclude: [ /node_modules/ ], use: [ 'ts-loader' ] },
    ],
  },
}

const config: webpack.Configuration[] = []

const header = require('./translators/minimal.json')
const label = 'minimal'
const vars = ['Translator']
  .concat((header.translatorType & 1) ? ['detectImport', 'doImport'] : [])
  .concat((header.translatorType & 2) ? ['doExport'] : [])
  .join(', ')

config.push(
  _.merge({}, common, {
    plugins: [
      new webpack.ProvidePlugin({ process: 'process/browser', }),
      new webpack.DefinePlugin({
        ZOTERO_TRANSLATOR_INFO: JSON.stringify(header),
      }),
      new PostCompile(() => {
        if (fs.existsSync(`build/resource/${label}.js`)) {
          // @ts-ignore TS2339
          if (!header.configOptions) header.configOptions = {}
          const source = fs.readFileSync(`build/resource/${label}.js`)
          const checksum = crypto.createHash('sha256')
          checksum.update(source)
          // @ts-ignore TS2339
          header.configOptions.hash = checksum.digest('hex')
          // @ts-ignore TS2339
          header.lastUpdated = (new Date).toISOString().replace(/T.*/, '')
          fs.writeFileSync(`build/resource/${label}.json`, JSON.stringify(header, null, 2))
        } else {
          console.log(`build/resource/${label}.js does not exist (yet?)`)
        }
      })
    ],
    context: path.resolve(__dirname, './translators'),
    entry: { [label]: `./${label}.ts` },

    output: {
      uniqueName: `Translator${label}`.replace(/ /g, ''),
      path: path.resolve(__dirname, './build/resource'),
      filename: '[name].js',
      pathinfo: true,
      library: `var {${vars}}`,
      libraryTarget: 'assign',
    },
  })
)

export default config
