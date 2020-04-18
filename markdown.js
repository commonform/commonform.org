const commonmark = require('commonmark')

module.exports = (markup) => {
  const reader = new commonmark.Parser()
  const writer = new commonmark.HtmlRenderer({ safe: true })
  const parsed = reader.parse(markup)
  return writer.render(parsed)
}
