module.exports = function (/* scripts */) {
  return `
<footer role=contentinfo>
  <p>
    <a href=https://typographyforlawyers.com/equity.html target=_blank>Equity</a>
    and
    <a href=https://typographyforlawyers.com/triplicate.html target=_blank>Triplicate</a>
    typefaces by
    <a href=https://typographyforlawyers.com/about.html target=_blank>Matthew Butterick</a>.
  </p>
  <p>
    <a href=https://fontawesome.com>Font Awesome</a>
    icons by Fonticons, Inc. under
    <a href=https://fontawesome.com/license>permissive license</a>.
  </p>
  <p>
    Common Form is
    <a href=https://github.com/commonform target=_blank>open source software</a>.
  </p>
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
