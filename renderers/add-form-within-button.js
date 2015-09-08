var h = require('virtual-dom/h')
var keyarray = require('keyarray')

function addFormWithinButton(state) {
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
  return h('button.addFormWithin',
    { onclick: function(event) {
        event.stopPropagation()
        var after = path
          .concat(contentKeys)
          .concat(content.length)
        emit('insertForm', after) } },
    'New § Here') }

module.exports = addFormWithinButton
