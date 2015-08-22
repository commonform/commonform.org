var fileName = require('../file-name')
var filesaver = require('filesaver.js').saveAs
var h = require('virtual-dom/h')
var pick = require('object-pick')
var persistedProperties = require('../persisted-properties')

function jsonBlob(object) {
  return new Blob(
    [ JSON.stringify(object) ],
    { type: 'application/json' }) }

function saveJSONButton(state) {
  return h('button.saveJSON',
    { href: '#',
      onclick: function(event) {
        event.preventDefault()
        var title = state.title
        filesaver(
          jsonBlob(pick(state, persistedProperties)),
          fileName(title, 'json')) } },
    'Save JSON') }

module.exports = saveJSONButton
