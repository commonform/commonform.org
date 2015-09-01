var h = require('virtual-dom/h')

function addFormWithinButton(state) {
  var emit = state.emit
  var path = state.path
  return h('button.addFormWithin',
    { onclick: function(event) {
        event.stopPropagation()
        var after = path
          .concat('form')
          .concat('content')
          .concat(state.data.form.content.length)
        emit('insertForm', after) } },
    'Add § Within') }

module.exports = addFormWithinButton
