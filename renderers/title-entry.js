var h = require('virtual-dom/h')
var titleInput = require('./title-input')

function titleEntry(state) {
  return h('p',
    [ h('label', 'Document Title'),
      titleInput(state) ]) }

module.exports = titleEntry
