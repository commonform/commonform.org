var deepEqual = require('deep-equal')
var h = require('virtual-dom/h')
var renderAnnotation = require('./annotation')

function annotations(state) {
  var path = state.path.concat('content')
  var matchingAnnotations = state.annotations
    .filter(function(annotation) {
      return deepEqual(annotation.path.slice(0, -1), path) })
  if (matchingAnnotations.length > 0) {
    return h('div.annotations',
      matchingAnnotations
        .map(function(annotation) {
          return renderAnnotation({ data: annotation }) })) } }

module.exports = annotations
