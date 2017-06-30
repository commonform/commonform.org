var h = require('../h')

module.exports = function input (value, set, clear, placeholder) {
  if (value && value.length > 0) {
    return h('span.blank', [
      value,
      h('a.clear', {
        title: 'Clear',
        onclick: function (event) {
          event.preventDefault()
          clear()
        }
      })
    ])
  } else {
    if (placeholder) {
      return h('input.blank',
        {
          placeholder: placeholder,
          onchange: function (event) {
            event.preventDefault()
            set(event.target.value)
          }
        }
      )
    } else {
      return h('input.blank',
        {
          onchange: function (event) {
            event.preventDefault()
            set(event.target.value)
          }
        }
      )
    }
  }
}
