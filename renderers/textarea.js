var h  = require('virtual-dom/h')
var markup = require('commonform-markup')
var resizeTextarea = require('../resize-textarea')

function resizeTarget(event) {
  // Delay a tiny amount so the new character, if any, will be added to the
  // <texarea> value by the time the resize routine runs.
  setTimeout(function() { resizeTextarea(event.target) }, 1) }

function textarea(state) {
  var offset = state.offset
  var length = state.data.content.length
  return h('textarea',
    { value: markup.stringify(state.data),
      onkeydown: resizeTarget,
      onpaste: resizeTarget,
      onchange: function(event) {
        resizeTarget(event)
        var elements
        try {
          elements = markup.parse(event.target.value).content }
        catch (e) {
          // TODO Address markup errors
          return }
        var contentPath = state.path.concat('content')
        state.emit(
          'splice', contentPath, offset, length, elements) } }) }

module.exports = textarea
