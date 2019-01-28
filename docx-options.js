var DOCX_STYLES = require('./docx-styles')
var outlineNumbering = require('outline-numbering')

module.exports = {
  centerTitle: false,
  indentMargins: true,
  markFilled: true,
  numbering: outlineNumbering,
  styles: DOCX_STYLES
}
