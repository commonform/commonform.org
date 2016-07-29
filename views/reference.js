var html = require('choo/html')

module.exports = function (heading) {
  return html`
    <a  class=reference
        title="Jump to ${heading}"
        href="#Heading:${heading}"
        onclick=${function () {
          document
          .getElementById('Heading:' + heading)
          .scrollIntoView()
        }}
        >${heading}</a>`
}
