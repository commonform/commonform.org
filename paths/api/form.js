module.exports = function (repository, digest) {
  return (
    'https://' + repository +
    '/forms/' + encodeURIComponent(digest)
  )
}
