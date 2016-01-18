module.exports = annotate

var critique = require('commonform-critique')
var lint = require('commonform-lint')
var treeify = require('commonform-treeify-annotations')

function annotate(form) {
  return treeify(
    [ ]
      .concat(critique(form))
      .concat(lint(form))
      .map(function(annotation) {
        annotation.path = annotation.path.slice(0, -2)
        return annotation })) }
