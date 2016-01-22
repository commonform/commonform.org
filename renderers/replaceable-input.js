module.exports = replaceableInput

var h = require('virtual-dom/h')

function replaceableInput(value, set, clear, placeholder) {
  if (value && value.length > 0) {
    return h('span.blank',
      [ value,
        h('a.clear',
          { title: 'Clear',
            onclick: function(event) {
              event.preventDefault()
              clear() } }) ]) }
  else {
    var options = {
      onchange: function(event) {
        event.preventDefault()
        set(event.target.value) } }
    if (placeholder) {
      options.placeholder = placeholder }
    return h('input.blank', options) } }
