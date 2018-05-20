var escape = require('../../util/escape')

module.exports = function (title) {
  return `<!doctype html>
<html lang=en>
  <head>
    <meta charset=ASCII>
    <title>Common Form${title ? (' / ' + escape(title)) : ''}</title>
    <link href=/normalize.css rel=stylesheet>
    <link href=/styles.css rel=stylesheet>
  </head>
  <body>`
}
