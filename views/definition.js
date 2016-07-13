const html = require('choo/html')

module.exports = function (term) {
  return html`
    <a  class=use
        id="Use of ${term}"
        title="Use of ${term}"o
      >${term}</a>
  `
}
