var h = require('../h')
var sidebar = require('./sidebar')

module.exports = function error (state, hasError, send) {
  return h('div.container',
    h('article.commonform', [
      sidebar('none', send),
      h('p', state[hasError].error.message)
    ])
  )
}
