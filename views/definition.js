var html = require('yo-yo')

module.exports = function (term) {
  return html`
    <dfn
        title="Definitin of ${term}"
        id="Definition:${term}"
      >${term}</dfn>
  `
}
