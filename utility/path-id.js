function pathID(path) {
  return path
    .map(function(element) {
      if (element === 'content') {
        return 'c' }
      else if (element === 'form') {
        return 'f' }
      else {
        return element.toString() } })
    .join('') }

module.exports = pathID
