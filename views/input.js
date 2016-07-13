const html = require('choo/html')

module.exports = function input (value, set, clear, placeholder) {
  if (value && value.length > 0) {
    return html`
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
    return html`
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
