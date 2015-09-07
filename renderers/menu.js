var addAboveButton = require('./add-above-button')
var addBelowButton = require('./add-below-button')
var addFormWithinButton = require('./add-form-within-button')
var addHeadingButton = require('./add-heading-button')
var addParagraphWithinButton = require('./add-paragraph-within-button')
var deleteButton = require('./delete-button')
var deleteHeadingButton = require('./delete-heading-button')
var digestLine = require('./digest-line')
var h = require('virtual-dom/h')
var replaceButton = require('./replace-button')
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
  var topForm = ( path.length === 0 )
  return h('div.menu',
    [ digestLine({ digest: digest }),
      h('.buttons', [
        ( !topForm ?
            [ shareButton({ form: data.form }), ' ' ] :
            undefined ),
        ( !topForm ?
            [ deleteButton(emitPath), ' ' ] :
            undefined ),
        replaceButton(emitPath), ' ',
        ( !topForm ?
            [ ( data.hasOwnProperty('heading') ?
              deleteHeadingButton(emitPath) :
              addHeadingButton(emitPath) ),
              ' ' ] :
            undefined ),
        ( !topForm ?
            [ addAboveButton(emitPath), ' ' ] :
            undefined ),
        ( !topForm ?
            [ addBelowButton(emitPath), ' ' ] :
            undefined ),
        addParagraphWithinButton(emitDataPath), ' ',
        addFormWithinButton(emitDataPath) ]) ]) }

module.exports = menu
