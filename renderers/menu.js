var addAboveButton = require('./add-above-button')
var addBelowButton = require('./add-below-button')
var addFormWithinButton = require('./add-form-within-button')
var addHeadingButton = require('./add-heading-button')
var addParagraphWithinButton = require('./add-paragraph-within-button')
var deleteButton = require('./delete-button')
var deleteHeadingButton = require('./delete-heading-button')
var digestLine = require('./digest-line')
var h = require('virtual-dom/h')
var pick = require('object-pick')
var shareButton = require('./share-button')

function menu(state) {
  // State
  var digest = state.digest
  var data = state.data
  // Derivations
  var pathEmit = pick(state, [ 'emit', 'path' ])
  var pathEmitData = pick(state, [ 'path', 'emit', 'data' ])
  return h('div.menu',
    [ digestLine({ digest: digest }),
      h('.buttons', [
        shareButton({ form: data.form }), ' ',
        deleteButton(pathEmit), ' ',
        ( data.hasOwnProperty('heading') ?
          deleteHeadingButton(pathEmit) :
          addHeadingButton(pathEmit) ), ' ',
        addAboveButton(pathEmit), ' ',
        addBelowButton(pathEmit), ' ',
        addParagraphWithinButton(pathEmitData), ' ',
        addFormWithinButton(pathEmitData) ]) ]) }

module.exports = menu
