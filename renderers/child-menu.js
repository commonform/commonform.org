var addAboveButton = require('./add-above-button')
var addBelowButton = require('./add-below-button')
var addHeadingButton = require('./add-heading-button')
var addWithinButton = require('./add-within-button')
var deleteButton = require('./delete-button')
var deleteHeadingButton = require('./delete-heading-button')
var fingerprintLink = require('./fingerprint-link')
var h = require('virtual-dom/h')

function childMenu(state) {
  return h('div.childMenu',
    [ fingerprintLink({ digest: state.merkle.digest }),
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
      addWithinButton(state) ] ) }

module.exports = childMenu
