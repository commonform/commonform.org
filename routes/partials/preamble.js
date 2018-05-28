var escape = require('../../util/escape')

module.exports = function (title) {
  return `<!doctype html>
<html lang=en>
  <head>
    <meta charset=UTF-8>
    <title>Common Form${title ? (' / ' + escape(title)) : ''}</title>
    <link href=/normalize.css rel=stylesheet>
    <link href=https://commonform.org/fonts.css rel=stylesheet>
    <link href=/styles.css rel=stylesheet>
  </head>
  <body>`
}
