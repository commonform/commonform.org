module.exports = function (repository, digest, publisher) {
  return (
    '/forms/' + encodeURIComponent(digest) +
    '/subscribers/' + encodeURIComponent(publisher)
  )
}
