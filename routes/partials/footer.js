module.exports = function (/* scripts */) {
  return `
<footer role=contentinfo>
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
