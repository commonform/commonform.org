var deepEqual = require('deep-equal')
var h = require('virtual-dom/h')
var renderAnnotation = require('./annotation')

function annotations(annotations) {
  if (annotations && annotations.length > 0) {
    return h('ul.annotations',
      annotations
        .map(function(annotation) {
          return h('li', [
            renderAnnotation({ data: annotation }) ]) })) } }

module.exports = annotations
