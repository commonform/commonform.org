var html = require('yo-yo')

module.exports = function (heading) {
  return html`
    <a  class=reference
        title="Jump to ${heading}"
        href="#Heading:${heading}"
        >${heading}</a>`
}
