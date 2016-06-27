var choo = require('choo')

module.exports = function (digest, send) {
  return choo.view`
    <a
        class=digest
        href="/forms/${digest}"
        onclick=${function () {
          send('form:load')
          send('form:fetch', {digest: digest})
        }}
      >${digest.slice(0, 32)}<wbr>${digest.slice(32)}</a>
  `
}

