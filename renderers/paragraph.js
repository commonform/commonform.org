module.exports = paragraph

var find = require('array-find')
var h = require('virtual-dom/h')
var predicates = require('commonform-predicate')

var renderers = [
  { predicate: predicates.text,
    renderer: require('./text') },
  { predicate: predicates.use,
    renderer: require('./use') },
  { predicate: predicates.definition,
    renderer: require('./definition') },
  { predicate: predicates.blank,
    renderer: require('./blank') },
  { predicate: predicates.reference,
    renderer: require('./reference') } ]

function paragraph(state) {
  var blanks = state.blanks
  var data = state.data
  var emit = state.emit
  var offset = state.offset
  var path = state.path
  return h('p',
    [ data.content
        .map(function(child, index) {
          var childPath = path
            .concat([ 'content', offset + index ])
          return find(renderers, function(renderer) {
            return renderer.predicate(child) })
          .renderer({
              blanks: blanks,
              data: child,
              emit: emit,
              path: childPath }) }) ]) }
