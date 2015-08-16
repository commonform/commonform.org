var analyze = require('commonform-analyze')
var lint = require('commonform-lint')
var main = require('main-loop')
var renderer = require('./renderers')
var vdom = require('virtual-dom')

var loop

function deriveData(state) {
  state.annotations = lint(state.data)
  state.analysis = analyze(state.data) }

var state = {
  path: [ ],
  blanks: {},
  update: function(mutation) {
    mutation(state)
    deriveData(state)
    loop.update(state) },
  data: require('./initial-data.json') }

deriveData(state)

module.exports = loop = main(state, renderer, vdom)
