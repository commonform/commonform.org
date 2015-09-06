var h = require('virtual-dom/h')

function addFormWithinButton(state) {
  var emit = state.emit
  var path = state.path
  var data = state.data
  return h('button.addFormWithin',
    { onclick: function(event) {
        event.stopPropagation()
        var after = path
          .concat('form')
          .concat('content')
          .concat(data.form.content.length)
        emit('insertForm', after) } },
    'Add § Within') }

module.exports = addFormWithinButton
