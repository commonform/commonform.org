var lint = require('commonform-lint')
var main = require('main-loop')
var renderer = require('./renderers')
var vdom = require('virtual-dom')

var loop

var state = {
  path: [ ],
  update: function(transform) {
    transform(state)
    state.annotations = lint(state.data)
    loop.update(state) },
  data: require('./initial-data.json') }

state.annotations = lint(state.data)

module.exports = loop = main(state, renderer, vdom)
