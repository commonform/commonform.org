var h = require('virtual-dom/h')

function addWithinButton(state) {
  var emit = state.emit
  var path = state.path
  return h('button.addWithin',
    { onclick: function() {
        var after = path
          .concat('form')
          .concat('content')
          .concat(state.data.form.content.length)
        emit('insert', after) } },
    'Add § Within') }

module.exports = addWithinButton
