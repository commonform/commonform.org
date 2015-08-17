var h = require('virtual-dom/h')
var deepEqual = require('deep-equal')
var renderAnnotation = require('./annotation')

function annotations(state) {
  var path = state.path.concat('content')
  var annotations = state.annotations
    .filter(function(annotation) {
      var annotationPath = annotation.path
      return deepEqual(
        annotationPath.slice(0, annotationPath.length - 1),
        path) })
  if (annotations.length > 0) {
    return h('div.annotations',
      annotations
        .map(function(annotation) {
          return renderAnnotation({ data: annotation }) })) } }

module.exports = annotations
