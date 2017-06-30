module.exports = function arrayStartsWith (longer, shorter) {
  for (var index = 0; index < shorter.length; index++) {
    if (longer[index] !== shorter[index]) {
      return false
    }
  }
  return true
}
