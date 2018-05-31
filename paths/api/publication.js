module.exports = function (repository, publisher, project, edition) {
  return (
    'https://' + repository +
    '/publishers/' + encodeURIComponent(publisher) +
    '/projects/' + encodeURIComponent(project) +
    '/publications/' + encodeURIComponent(edition)
  )
}
