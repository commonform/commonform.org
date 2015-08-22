function pathID(digest, path) {
  return (
    digest +
    '/' +
    path
      .filter(function(key) {
        return key !== 'content' && key !== 'form' })
      .join('.') ) }

module.exports = pathID
