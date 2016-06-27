const critique = require('commonform-critique')
const lint = require('commonform-lint')
const treeify = require('commonform-treeify-annotations')

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
