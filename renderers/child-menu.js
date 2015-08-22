var h = require('virtual-dom/h')
var deleteButton = require('./delete-button')

function childMenu(state) {
  return h('div.childMenu',
    [ deleteButton(state) ] ) }

module.exports = childMenu
