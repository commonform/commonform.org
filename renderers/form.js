var find = require('array-find')
var h = require('virtual-dom/h')
var predicates = require('commonform-predicate')

var renderers = [
  { predicate: predicates.form,
    renderer: require('./form') },
  { predicate: predicates.child,
    renderer: require('./child') },
  { predicate: predicates.blank,
    renderer: require('./blank') },
  { predicate: predicates.definition,
    renderer: require('./definition') },
  { predicate: predicates.reference,
    renderer: require('./reference') },
  { predicate: predicates.use,
    renderer: require('./use') } ]

function form(state) {
  return h('div.form', state.content.map(function(child) {
    if (predicates.text(child)) {
      return h('span', child) }
    else {
      var renderer = find(renderers, function(renderer) {
        return renderer.predicate(child) })
      if (renderer) {
        return renderer.renderer(child) } } })) }

module.exports = form
