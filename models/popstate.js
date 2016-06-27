const welcome = require('../welcome')

module.exports = {
  subscriptions: [ fetchFormOn('load'), fetchFormOn('popstate') ]
}

const HASH = /([0-9a-f]{64})$/

function fetchFormOn (event) {
  return function (send) {
    window.addEventListener(event, function () {
      var path = window.location.pathname
      if (path === '/') send('form:fetch', {digest: welcome.digest})
      else {
        var match = HASH.exec(window.location.pathname)
        if (match) send('form:fetch', {digest: match[1]})
      }
    })
  }
}
