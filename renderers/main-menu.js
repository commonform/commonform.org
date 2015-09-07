var digestLine = require('./digest-line')
var h = require('virtual-dom/h')
var openJSONButton = require('./open-json-button')
var saveDOCXButton = require('./save-docx-button')
var saveJSONButton = require('./save-json-button')
var shareButton = require('./share-button')

function mainMenu(state) {
  // State
  var blanks = state.blanks
  var data = state.data
  var digest = state.digest
  var emit = state.emit
  var title = state.title
  // Derivations
  var saveState = {
    blanks: blanks,
    title: title,
    data: data }
  return h('menu', [
    digestLine({ digest: digest }),
    shareButton({ form: data }), ' ',
    saveDOCXButton(saveState), ' ',
    saveJSONButton(saveState), ' ',
    openJSONButton({
      blanks: blanks,
      data: data,
      emit: emit,
      title: title }) ]) }

module.exports = mainMenu
