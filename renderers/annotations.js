var h = require('virtual-dom/h')
var deepEqual = require('deep-equal')
var renderAnnotation = require('./annotation')

function annotations(state) {
  var path = state.path.concat('content')
  var annotations = state.annotations
  return h('div.annotations', 
    annotations
      .filter(function(annotation) {
        var annotationPath = annotation.path
        return deepEqual(
          annotationPath.slice(0, annotationPath.length - 1),
          path) })
      .map(function(annotation) {
        return renderAnnotation({ data: annotation }) })) }

module.exports = annotations
