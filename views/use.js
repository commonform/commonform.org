const html = require('choo/html')

module.exports = function (term) {
  return html`
    <dfn
        title="Jump to definition of ${term}"
        href="#Definition ${term}"
      >${term}</dfn>
  `
}
