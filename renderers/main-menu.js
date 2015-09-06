var h = require('virtual-dom/h')
var openJSONButton = require('./open-json-button')
var persistedProperties = require('../utility/persisted-properties.json')
var pick = require('object-pick')
var saveDOCXButton = require('./save-docx-button')
var saveJSONButton = require('./save-json-button')
var shareButton = require('./share-button')

function mainMenu(state) {
  var persistedState = pick(state, persistedProperties)
  return h('menu', [
    shareButton({ form: state.data }), ' ',
    saveDOCXButton(persistedState), ' ',
    saveJSONButton(persistedState), ' ',
    openJSONButton(pick(state, [ 'emit' ])) ]) }

module.exports = mainMenu
