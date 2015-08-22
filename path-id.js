function pathID(fingerprint, path) {
  return (
    fingerprint +
    '/' +
    path
      .filter(function(key) {
        return key !== 'content' && key !== 'form' })
      .join('.') ) }

module.exports = pathID
