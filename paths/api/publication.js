module.exports = function () {
  var firstArgument = arguments[0]
  var publisher, project, edition
  if (typeof firstArgument === 'string') {
    publisher = arguments[0]
    project = arguments[1]
    edition = arguments[2]
  } else {
    project = firstArgument.oject
    publisher = firstArgument.publisher
    edition = firstArgument.edition
  }
  return (
    '/publishers/' + encodeURIComponent(publisher) +
    '/projects/' + encodeURIComponent(project) +
    '/publications/' + encodeURIComponent(edition)
  )
}
