Function.prototype.bind = (
  Function.prototype.bind || require('function-bind') )

var loop = require('./loop')

document
  .querySelector('#browser')
  .appendChild(loop.target)
