var Cache = require('level-lru-cache')
var leveljs = require('level-js')
var levelup = require('levelup')

var level = levelup('commonform', {db: leveljs})

module.exports = new Cache(level, 100)
