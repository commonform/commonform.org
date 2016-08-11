var html = require('yo-yo')

module.exports = function (term) {
  return html`
    <dfn
        title="Definition of ${term}"
        id="Definition:${term}"
      >${term}</dfn>
  `
}
