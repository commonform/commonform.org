var h = require('virtual-dom/h')
var openJSONButton = require('./open-json-button')
var saveDOCXButton = require('./save-docx-button')
var saveJSONButton = require('./save-json-button')
var shareButton = require('./share-button')

function mainMenu(state) {
  return h('menu', [
    shareButton({ form: state.data }), ' ',
    saveDOCXButton(state), ' ',
    saveJSONButton(state), ' ',
    openJSONButton(state.emit) ]) }

module.exports = mainMenu
