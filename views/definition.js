var choo = require('choo')

module.exports = function (term) {
  return choo.view`
    <a  class=use
        id="Use of ${term}"
        title="Use of ${term}"o
      >${term}</a>
  `
}
