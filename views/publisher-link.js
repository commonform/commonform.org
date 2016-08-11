var html = require('yo-yo')

module.exports = function publisherLink (publisher, send) {
  return html`
    <a
        class=publisher
        href="/publishers/${encodeURIComponent(publisher)}"
      >${publisher}</a>
  `
}
