const personalConfig = require('../config/index')

const defaultConfig = {
  dev: {
    nodeEnv: 'development',
    hash: false,
    port: '8088'
  },
  prod: {
    nodeEnv: 'production',
    hash: 10,
    prot: '8080'
  }
}

// merge config

function merge (obj, mergeObj) {
  let result
  if (obj && typeof obj === 'object') { // object array
    obj.constructor === Array ? (result = []) : (result = {})
    for (let key in obj) {
      result[key] = merge(obj[key], mergeObj && typeof mergeObj === 'object' && mergeObj[key] || null)
    }
  } else {
    result = mergeObj || obj
  }
  return result
}

module.exports = merge(defaultConfig, personalConfig)
