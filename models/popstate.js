var welcome = require('../data/welcome')

module.exports = {
  subscriptions: [fetchFormOn('load'), fetchFormOn('popstate')]
}

var HASH = /([0-9a-f]{64})$/

function fetchFormOn (event) {
  return function (send, done) {
    window.addEventListener(event, function () {
      var location = window.location
      var match
      var data
      var path = location.pathname
      if (path === '/') {
        send('form:fetch', {digest: welcome.digest}, yieldError)
      } else {
        match = HASH.exec(location.pathname)
        if (match) {
          data = {digest: match[1]}
          send('form:fetch', data, yieldError)
        }
      }
      var hash = window.location.hash
      if (hash.indexOf('#compare:') === 0) {
        match = HASH.exec(hash)
        if (match) {
          data = {digest: match[1], comparing: true}
          send('form:fetch', data, yieldError)
        }
      }
      function yieldError (error) {
        if (error) done(error)
      }
    })
  }
}
