const choo = require('choo')

module.exports = function (heading) {
  return choo.view`
    <a  class=reference
        title="Jump to ${heading}"
        href="#Heading ${heading}"
        >${heading}</a>`
}
