module.exports = function (/* scripts */) {
  return `
<footer role=contentinfo>
  <p>
    <a href=https://typographyforlawyers.com/equity.html>Equity</a>
    and
    <a href=https://typographyforlawyers.com/triplicate.html>Triplicate</a>
    typefaces by
    <a href=https://typographyforlawyers.com/about.html>Matthew Butterick</a>.
  </p>
  <p>Common Form is <a href=https://github.com/commonform>open source software</a>.</p>
</footer>
${
  Array.prototype.slice.call(arguments)
    .map(function (script) {
      return `<script src=${script}></script>`
    })
    .join('')
}
</body>
</html>`
}
