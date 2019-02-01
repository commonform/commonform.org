var escape = require('./escape')
var linkifyURLs = require('linkify-urls')
var toMentionLink = require('to-mention-link')

module.exports = function (string) {
  return mentions(urls(string))
}

function urls (string) {
  return linkifyURLs(string, { attributes: { target: '_blank' } })
}

function mentions (string) {
  return toMentionLink(
    string,
    {
      url: 'https://commonform.org',
      renderer: function (mention, url, title) {
        return `<a href="${escape(url)}">${escape(mention)}</a>`
      }
    }
  )
}
