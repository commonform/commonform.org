var addAboveButton = require('./add-above-button')
var addBelowButton = require('./add-below-button')
var addHeadingButton = require('./add-heading-button')
var deleteButton = require('./delete-button')
var deleteHeadingButton = require('./delete-heading-button')
var h = require('virtual-dom/h')

function childMenu(state) {
  return h('div.childMenu',
    [ deleteButton(state),
      ( state.data.hasOwnProperty('heading') ?
        deleteHeadingButton(state) :
        addHeadingButton(state) ),
      addAboveButton(state),
      addBelowButton(state),
      h('a.fingerprint',
        { href: '/#' + state.merkle.digest,
          target: '_blank' },
        state.merkle.digest) ] ) }

module.exports = childMenu
