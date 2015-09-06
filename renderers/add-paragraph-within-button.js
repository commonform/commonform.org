var h = require('virtual-dom/h')
var predicate = require('commonform-predicate')

function addParagraphWithinButton(state) {
  // State
  var emit = state.emit
  var path = state.path
  var data = state.data
  // Derivations
  var last = data.form.content[data.form.content.length - 1]
  if (predicate.child(last)) {
    return h('button.addParagraphWithin',
      { onclick: function(event) {
          event.stopPropagation()
          var after = path
            .concat('form')
            .concat('content')
            .concat(data.form.content.length)
          emit('insertParagraph', after) } },
      'Add ¶ Within') } }

module.exports = addParagraphWithinButton
