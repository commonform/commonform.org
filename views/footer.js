var literal = require('../html/literal')

module.exports = function () {
  return literal`
    <footer>
      <p>
        <a href="http://typographyforlawyers.com/equity.html">
          Equity
        </a>
        and
        <a href="http://typographyforlawyers.com/triplicate.html">
          Triplicate
        </a>
        typefaces by
        <a href="http://typographyforlawyers.com/about.html"
          >Matthew Butterick</a>.
      </p>
      <p>
        <a href="http://www.linea.io">linea icons</a> by Dario Ferrando.
      </p>
      <p>
        <a class=openSource>
          Common Form is
          <a href="https://github.com/commonform"
            >open-source software</a>.
        </a>
      </p>
    </footer>
  `
}
