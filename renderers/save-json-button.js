var fileName = require('../utility/file-name')
var filesaver = require('filesaver.js').saveAs
var h = require('virtual-dom/h')

function jsonBlob(object) {
  return new Blob(
    [ JSON.stringify(object) ],
    { type: 'application/json' }) }

function saveJSONButton(state) {
  var blanks = state.blanks
  var data = state.data
  var title = state.title
  return h('button.saveJSON',
    { href: '/#',
      onclick: function(event) {
        event.preventDefault()
        event.stopPropagation()
        filesaver(
          jsonBlob({
            blanks: blanks,
            data: data,
            title: title }),
          fileName(title, 'json')) } },
    'Save JSON') }

module.exports = saveJSONButton
