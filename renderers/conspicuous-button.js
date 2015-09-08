var h = require('virtual-dom/h')

module.exports = conspicuousButton

function conspicuousButton(state) {
  // State
  var conspicuous = state.conspicuous
  var emit = state.emit
  var path = state.path

  // Rendering
  return h('button.conspicuous',
    { onclick: function(event) {
      event.stopPropagation()
      var conspicuousPath = path.concat('form', 'conspicuous')
      if (conspicuous) {
        emit('delete', conspicuousPath) }
      else {
        emit('set', conspicuousPath, 'yes') } } },
    'Conspicuous') }
