var Cache = require('level-lru-cache')
var level = require('./level')

module.exports = new Cache(level, 100)
