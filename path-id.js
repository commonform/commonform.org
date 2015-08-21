function pathID(path) {
  return (
    'form:' +
    path
      .filter(function(key) {
        return key !== 'content' && key !== 'form' })
      .join('.') ) }

module.exports = pathID
