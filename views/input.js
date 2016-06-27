var choo = require('choo')

module.exports = function input (value, set, clear, placeholder) {
  if (value && value.length > 0) {
    return choo.view`
      <span class=blank>
        ${value}
        <a  class=clear
            title="Clear"
            onclick=${(e) => {
              e.preventDefault()
              clear()
            }}></a>
      </span>
    `
  } else {
    return choo.view`
      <input
          class=blank
          placeholder="${placeholder || ''}"
          onchange=${(e) => {
            e.preventDefault()
            set(e.target.value)
          }}>
    `
  }
}
