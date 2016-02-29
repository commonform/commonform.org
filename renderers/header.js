module.exports = header

var h = require('virtual-dom/h')
var renderDigest = require('./digest')
var renderProjects = require('./projects')
var thunk = require('vdom-thunk')

function header(state) {
  var digest = state.digest
  var projects = state.projects
  return h('header', [
    thunk(renderDigest, digest),
    thunk(renderProjects, projects) ]) }
