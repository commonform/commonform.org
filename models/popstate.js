const welcome = require('../data/welcome')

module.exports = {
  subscriptions: [ fetchFormOn('load'), fetchFormOn('popstate') ]
}

const HASH = /([0-9a-f]{64})$/

function fetchFormOn (event) {
  return function (send) {
    window.addEventListener(event, function () {
      const location = window.location
      var match
      var path = location.pathname
      if (path === '/') send('form:fetch', {digest: welcome.digest})
      else {
        match = HASH.exec(location.pathname)
        if (match) send('form:fetch', {digest: match[1]})
      }
      const hash = window.location.hash
      if (hash.indexOf('#compare:') === 0) {
        match = HASH.exec(hash)
        if (match) send('form:fetch', {digest: match[1], comparing: true})
      }
    })
  }
}
