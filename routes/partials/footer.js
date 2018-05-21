module.exports = function (/* scripts */) {
  return `
<footer role=contentinfo>
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
