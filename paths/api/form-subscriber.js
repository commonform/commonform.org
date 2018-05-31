module.exports = function (digest, publisher) {
  return (
    '/forms/' + encodeURIComponent(digest) +
    '/subscribers/' + encodeURIComponent(publisher)
  )
}
