const html = require('choo/html')

module.exports = function (term) {
  return html`
    <dfn
        title="Definitin of ${term}"
        id="Definition:${term}"
      >${term}</dfn>
  `
}
