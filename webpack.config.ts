// tslint:disable:no-console

import * as webpack from 'webpack'
import * as path from 'path'

const label = 'minimal'
const config: webpack.Configuration = {
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
  },
  module: {
    rules: [
      { test: /\.ts$/, exclude: [ /node_modules/ ], use: [ 'ts-loader' ] },
    ],
  },
  context: path.resolve(__dirname, './translators'),
  entry: { [label]: `./${label}.ts` },

  output: {
    uniqueName: `Translator${label}`.replace(/ /g, ''),
    path: path.resolve(__dirname, './build/resource'),
    filename: '[name].js',
    pathinfo: true,
    library: `var MyModule`,
    libraryTarget: 'assign',
  }
}

export default config
