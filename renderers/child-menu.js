var addAboveButton = require('./add-above-button')
var addBelowButton = require('./add-below-button')
var deleteButton = require('./delete-button')
var h = require('virtual-dom/h')

function childMenu(state) {
  return h('div.childMenu',
    [ deleteButton(state),
      addAboveButton(state),
      addBelowButton(state) ] ) }

module.exports = childMenu
