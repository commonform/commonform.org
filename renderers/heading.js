var h = require('virtual-dom/h')

function heading(state) {
  var data = state.data
  var depth = state.depth
  var emit = state.emit
  var isFocused = state.isFocused
  var path = state.path
  if (isFocused) {
    return h('input.heading',
      { value: data,
        onchange: function(event) {
          var headingPath = path.concat('heading')
          var newValue = event.target.value
          emit('set', headingPath, newValue) },
        onkeydown: function(event) {
          if (event.keyCode === 13) {
            event.target.blur() } } }) }
  else {
    var name = (
      depth <= 5 ?
        ( 'h' + ( depth + 1) ) :
        ( 'span.heading.h' + ( depth + 1 ) ) )
    return h(
      name,
      { id: ( 'heading:' + data ) },
      data) } }

module.exports = heading
