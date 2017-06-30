module.exports = function sameKeyArray (a, b) {
  var aLength = a.length
  var bLength = b.length
  if (aLength !== bLength) {
    return false
  }
  for (var index = 0; index < aLength; index++) {
    if (a[index] !== b[index]) {
      return false
    }
  }
  return true
}
