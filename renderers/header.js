module.exports = header

var h = require('virtual-dom/h')
var renderDigest = require('./digest')
var thunk = require('vdom-thunk')

function header(state) {
  var digest = state.digest
  var comparingDigest = state.comparingDigest
  return h('header',
    [ thunk(renderDigest, digest),
      ( !comparingDigest ? null :
          [ h('br'),
            'compared to',
            h('br'),
            thunk(renderDigest, comparingDigest) ] ) ]) }
