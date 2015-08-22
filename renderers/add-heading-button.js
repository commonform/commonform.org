var h = require('virtual-dom/h')

function addHeadingButton(state) {
  var emit = state.emit
  var path = state.path
  return h('button.addHeading',
    { onclick: function(event) {
        var headingPath = path.concat('heading')
        emit('set', headingPath, 'New Heading') } },
    'Add Heading') }

module.exports = addHeadingButton
