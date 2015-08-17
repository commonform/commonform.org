var h = require('virtual-dom/h')
var docx = require('commonform-docx')
var filesaver = require('filesaver.js').saveAs

function jsonBlob(object) {
  return new Blob(
    [ JSON.stringify(object) ],
    { type: 'application/json' }) }

function fileName(title, extension) {
  var date = new Date().toISOString();
  return ( '' + title + ' ' + date + '.' + extension ) }

function mainMenu(state) {
  return h('div.mainMenu', [
    h('a.saveDOCX',
      { href: '#',
        onclick: function(event) {
          event.preventDefault()
          var title = state.title
          var form = state.data
          var blanks = state.blanks
          var zip = docx(title, form, blanks)
          var date = new Date().toISOString()
          filesaver(
            zip.generate({ type: 'blob' }),
            fileName(title, 'docx')) } },
      'Save DOCX'),
    h('a.saveJSON',
      { href: '#',
        onclick: function(event) {
          event.preventDefault()
          var title = state.title
          var date = new Date().toISOString()
          filesaver(
            jsonBlob({
              path: [ ],
              title: state.title,
              blanks: state.blanks,
              data: state.data }),
            fileName(title, 'json')) } },
      'Save JSON') ]) }

module.exports = mainMenu
