var addAboveButton = require('./add-above-button')
var addBelowButton = require('./add-below-button')
var addFormWithinButton = require('./add-form-within-button')
var addHeadingButton = require('./add-heading-button')
var addParagraphWithinButton = require('./add-paragraph-within-button')
var deleteButton = require('./delete-button')
var deleteHeadingButton = require('./delete-heading-button')
var digestLine = require('./digest-line')
var h = require('virtual-dom/h')
var shareButton = require('./share-button')

function menu(state) {
  // State
  var data = state.data
  var digest = state.digest
  var emit = state.emit
  var path = state.path
  // Derivations
  var emitPath = { emit: emit, path: path }
  var emitDataPath = { emit: emit, data: data, path: path }
  return h('div.menu',
    [ digestLine({ digest: digest }),
      h('.buttons', [
        shareButton({ form: data.form }), ' ',
        deleteButton(emitPath), ' ',
        ( data.hasOwnProperty('heading') ?
          deleteHeadingButton(emitPath) :
          addHeadingButton(emitPath) ), ' ',
        addAboveButton(emitPath), ' ',
        addBelowButton(emitPath), ' ',
        addParagraphWithinButton(emitDataPath), ' ',
        addFormWithinButton(emitDataPath) ]) ]) }

module.exports = menu
