var h = require('virtual-dom/h')
var docx = require('commonform-docx')
var filesaver = require('filesaver.js').saveAs

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
          var date = new Date().toISOString();
          filesaver(
            zip.generate({type: 'blob'}),
            title + ' ' + date + '.docx') } },
      'Save DOCX') ]) }

module.exports = mainMenu
