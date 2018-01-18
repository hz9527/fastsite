const path = require('path')
const webpack = require('webpack')
const Config = require('./config')
const env = (process.env.NODE_ENV || config.dev.nodeEnv) === config.prod.nodeEnv ? 'prod' : 'dev'
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin')

function getHash () {
  let hash = ''
  if (Config[env].hash) {
    hash = `.[chunkhash${typeof Config[env].hash === 'number' ? ':' + Config[env].hash : ''}]`
  }
  return hash
}

const VueLoaderOption = {
  extractCSS: env === 'prod',
  preserveWhitespace: false,
  postcss: [
    require('autoprefixer')({
      browsers: ['last 3 versions']
    })
  ]
}

function getCssLoaders () {
  if (env === 'prod') {
    ExtractTextPlugin.extract({
              use: 'css-loader?minimize',
              fallback: 'vue-style-loader'
            })
  } else {
    return ['vue-style-loader', 'css-loader']
  }
}

function getPlugins () {
  if (env === 'prod') {
    return [
      new webpack.optimize.UglifyJsPlugin({compress: { warnings: false }}),
      new webpack.optimize.ModuleConcatenationPlugin(),
      new ExtractTextPlugin({
        filename: `common${getHash()}.css`
      })
    ]
  } else {
    return [new FriendlyErrorsPlugin()]
  }
}


module.exports = {
  output: {
    path: path.join(__dirname, '../dist'),
    fileName: `[name]${getHash()}.js`
  },
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        options: VueLoaderOption
      },
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /node_modules/
      },
      {
        test: /\.(png|jpg|gif|svg)$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: '[name].[ext]?[hash]'
        }
      },
      {
        test: /\.css$/,
        use: getCssLoaders()
    ]
  },
  plugins: getPlugins()
}
