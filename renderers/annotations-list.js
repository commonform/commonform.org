var h = require('virtual-dom/h')
var renderAnnotation = require('./annotation')

function annotationsList(annotations) {
  if (annotations && annotations.length > 0) {
    return h('aside',
      annotations
        .map(function(annotation) {
          return renderAnnotation({ data: annotation }) })) } }

module.exports = annotationsList
