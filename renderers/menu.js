var addAboveButton = require('./add-above-button')
var addBelowButton = require('./add-below-button')
var addHeadingButton = require('./add-heading-button')
var addWithinButton = require('./add-within-button')
var deleteButton = require('./delete-button')
var deleteHeadingButton = require('./delete-heading-button')
var digest = require('./digest')
var h = require('virtual-dom/h')

function menu(state) {
  return h('div.menu',
    [ digest({ digest: state.merkle.digest }),
      h('.buttons', [
        deleteButton(state),
        ' ',
        ( state.data.hasOwnProperty('heading') ?
          deleteHeadingButton(state) :
          addHeadingButton(state) ),
        ' ',
        addAboveButton(state),
        ' ',
        addBelowButton(state),
        ' ',
        addWithinButton(state) ]) ]) }

module.exports = menu
