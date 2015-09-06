var find = require('array-find')
var h = require('virtual-dom/h')
var predicates = require('commonform-predicate')
var textarea = require('./textarea')

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
  var data = state.data
  var isFocused = state.isFocused
  var offset = state.offset
  var path = state.path
  if (isFocused) {
    return textarea(state) }
  else {
    return h('p',
      [ data.content
          .map(function(child, index) {
            var childPath = path
              .concat([ 'content', offset + index ])
            return find(renderers, function(renderer) {
              return renderer.predicate(child) })
            .renderer({
                data: child,
                path: childPath }) }) ]) } }

module.exports = paragraph
