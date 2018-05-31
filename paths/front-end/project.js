module.exports = function () {
  var firstArgument = arguments[0]
  var publisher
  var project
  if (typeof firstArgument === 'string') {
    publisher = arguments[0]
    project = arguments[1]
  } else {
    publisher = firstArgument.publisher
    project = firstArgument.project
  }
  return (
    '/' + encodeURIComponent(publisher) +
    '/' + encodeURIComponent(project)
  )
}
