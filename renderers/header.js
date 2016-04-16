module.exports = header

var h = require('virtual-dom/h')
var renderDigest = require('./digest')
var renderProjects = require('./projects')
var thunk = require('vdom-thunk')

function header(state) {
  var digest = state.digest
  var projects = state.projects
  var comparingDigest = state.comparingDigest
  return h('header', [
    h('p', [ thunk(renderDigest, digest) ]),
    ( comparingDigest
        ? [ h('p', 'compared to'),
            h('p', [ thunk(renderDigest, comparingDigest) ]) ]
        : null ),
    thunk(renderProjects, projects) ]) }
