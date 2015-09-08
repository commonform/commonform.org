var deleteButton = require('./delete-button')
var digestLine = require('./digest-line')
var h = require('virtual-dom/h')
var openButton = require('./open-button')
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
        openButton({ digest: digest }) ]) ]) }

module.exports = menu
