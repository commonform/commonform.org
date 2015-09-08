var h = require('virtual-dom/h')

function heading(state) {
  var heading = state.heading
  var depth = state.depth
  var emit = state.emit
  var isFocused = state.isFocused
  var path = state.path
  if (isFocused) {
    return h('input.heading',
      { value: ( heading ? heading : '' ),
        placeholder: 'Click to add heading',
        onchange: function(event) {
          var headingPath = path.concat('heading')
          var newValue = event.target.value
          if (newValue.length > 0) {
            emit('set', headingPath, newValue) }
          else {
            emit('delete', headingPath) } },
        onkeydown: function(event) {
          if (event.keyCode === 13) {
            event.target.blur() } } }) }
  else {
    if (heading) {
      var name = (
        depth <= 5 ?
          ( 'h' + ( depth + 1) ) :
          ( 'span.heading.h' + ( depth + 1 ) ) )
      return h(
        name,
        { id: ( 'heading:' + heading ) },
        heading) } } }

module.exports = heading
