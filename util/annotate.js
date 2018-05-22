var annotators = [
  require('commonform-archaic'),
  require('commonform-wordy'),
  require('doubleplus-numbers'),
  require('commonform-lint'),
  require('commonform-mscd')
]

module.exports = function (form) {
  var annotations = []
  annotators.forEach(function (annotator) {
    annotator(form).forEach(function (annotation) {
      annotations.push(annotation)
    })
  })
  return annotations
}
