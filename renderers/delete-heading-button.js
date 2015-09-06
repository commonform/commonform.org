var h = require('virtual-dom/h')

function deleteHeadingButton(state) {
  var emit = state.emit
  var path = state.path
  return h('button.deleteHeading',
    { onclick: function() {
        var headingPath = path.concat('heading')
        emit('delete', headingPath) } },
    'No Heading') }

module.exports = deleteHeadingButton
