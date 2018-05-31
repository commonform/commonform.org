module.exports = function (repository, digest) {
  return '/forms/' + encodeURIComponent(digest)
}
