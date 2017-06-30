var annotators = require('../annotators')
var find = require('array-find')

module.exports = function (flags, form) {
  var annotations = []
  Object.keys(flags).forEach(function (name) {
    if (flags[name] === true) {
      find(annotators, function (annotator) {
        return annotator.name === name
      })
        .annotate(form)
        .forEach(function (annotation) {
          annotation.path = annotation.path.slice(0, -2)
          annotations.push(annotation)
        })
    }
  })
  return annotations
}
