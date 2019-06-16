var escape = require('../../util/escape')

module.exports = function (title, metadata) {
  if (metadata) {
    if (!metadata.image) {
      metadata.image = 'https://' + process.env.DOMAIN + '/logo-on-white.png'
    }
    var twitter = `
      <!-- Twitter Card -->
      <meta name="twitter:card" content="summary">
      <meta name="twitter:title" content="${escape(metadata.title)}">
      <meta name="twitter:description" content="${escape(metadata.description)}">
      <meta name="twitter:image" content="${escape(metadata.image)}">
    `
    var openGraph = `
      <!-- OpenGraph -->
      <meta name="og:type" content="website">
      <meta name="og:title" content="${escape(metadata.title)}">
      <meta name="og:description" content="${escape(metadata.description)}">
      <meta name="og:image" content="${escape(metadata.image)}">
    `
  }
  return `<!doctype html>
<html lang=en>
  <head>
    <meta charset=UTF-8>
    <meta name=viewport content="width=device-width, initial-scale=1">
    <title>Common Form${title ? (' / ' + escape(title)) : ''}</title>
    <link href=/normalize.css rel=stylesheet>
    <link href=https://commonform.org/fonts.css rel=stylesheet>
    <link href=/styles.css rel=stylesheet>
    <noscript><style>.yesscript { display:none; }</style></noscript>
    ${twitter || ''}
    ${openGraph || ''}
  </head>
  <body>`
}
