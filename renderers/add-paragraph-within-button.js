var h = require('virtual-dom/h')
var keyarray = require('keyarray')
var predicate = require('commonform-predicate')

function addParagraphWithinButton(state) {
  // State
  var emit = state.emit
  var path = state.path
  var data = state.data
  // Derivations
  var contentKeys = (
    path.length === 0 ?
      [ 'content' ] :
      [ 'form', 'content' ])
  var content = keyarray.get(data, contentKeys)
  var last = content[content.length - 1]
  if (predicate.child(last)) {
    return h('button.addParagraphWithin',
      { onclick: function(event) {
          event.stopPropagation()
          var after = path
            .concat(contentKeys)
            .concat(content.length)
          emit('insertParagraph', after) } },
      'Add Sub-¶') } }

module.exports = addParagraphWithinButton
