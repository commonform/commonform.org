var leveljs = require('level-js')
var levelup = require('levelup')
module.exports = levelup('commonform', {db: leveljs})
