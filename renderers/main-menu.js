var h = require('virtual-dom/h')
var openJSONButton = require('./open-json-button')
var saveDOCXButton = require('./save-docx-button')
var saveJSONButton = require('./save-json-button')

function mainMenu(state) {
  return h('menu', [
    saveDOCXButton(state), ' ',
    saveJSONButton(state), ' ',
    openJSONButton(state.emit) ]) }

module.exports = mainMenu
