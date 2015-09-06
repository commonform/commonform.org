var h = require('virtual-dom/h')
var titleInput = require('./title-input')

function titleEntry(state) {
  return h('p',
    [ h('div.name', 'Document Title'),
      h('div.value', titleInput(state)) ]) }

module.exports = titleEntry
