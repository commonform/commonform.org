var choo = require('choo')

module.exports = function (term) {
  return choo.view`
    <dfn
        title="Jump to definition of ${term}"
        href="#Definition ${term}"
      >${term}</dfn>
  `
}
