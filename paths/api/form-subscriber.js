module.exports = function (repository, digest, publisher) {
  return (
    'https://' + repository +
    '/forms/' + encodeURIComponent(digest) +
    '/subscribers/' + encodeURIComponent(publisher)
  )
}
