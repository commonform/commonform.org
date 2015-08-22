var h = require('virtual-dom/h')

function addBelowButton(state) {
  var emit = state.emit
  var path = state.path
  return h('button.addBelow',
    { onclick: function(event) {
        var after = path.slice(0, -1)
          .concat(path[path.length - 1] + 1)
        emit('insert', after) } },
    'Add § Below') }

module.exports = addBelowButton
