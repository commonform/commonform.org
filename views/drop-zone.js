var assert = require('assert')
var html = require('choo/html')

module.exports = dropZone

var EFFECTS = ['child', 'move']

function dropZone (effect, path, send) {
  assert.equal(typeof send, 'function')
  assert(EFFECTS.indexOf(effect) !== -1)
  assert(Array.isArray(path))
  var onClick
  var title
  if (effect === 'child') {
    onClick = function (event) {
      send('form:child', {path: path})
    }
    title = 'Click to add a child form here.'
  } else /* if (effect === 'move') */ {
    onClick = function (event) {
      send('form:move', {path: path})
    }
    title = 'Click to move child form here.'
  }
  return html`
    <div
        class=dropZone
        title=${title}
        onclick=${onClick}
      ></div>
  `
}
