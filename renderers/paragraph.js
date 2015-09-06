var find = require('array-find')
var h = require('virtual-dom/h')
var markup = require('commonform-markup')
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
  if (state.isFocused) {
    return h('textarea',
      { value: markup.stringify(state.data) }) }
  else {
    return h('p',
      [ state.data.content
          .map(function(child, index) {
            var childPath = state.path
              .concat([ 'content', state.offset + index ])
            return find(renderers, function(renderer) {
              return renderer.predicate(child) })
            .renderer({
                data: child,
                path: childPath }) }) ]) } }

module.exports = paragraph
