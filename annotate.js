var critique = require('commonform-critique')
var lint = require('commonform-lint')
var treeify = require('commonform-treeify-annotations')

module.exports = function (form) {
  return treeify([]
    .concat(critique(form))
    .concat(lint(form))
    .map(function (annotation) {
      annotation.path = annotation.path.slice(0, -2)
      return annotation
    })
  )
}
