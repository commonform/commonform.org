var wordCharacter = /[a-zA-Z-]/

module.exports = function splitWords(string) {
  var returned = [ ]

  var bufferedSubstring
  resetBuffer()

  var length = string.length

  for (var index = 0; index < length; index++) {
    var character = string.charAt(index)
    if (wordCharacter.test(character)) {
      bufferedSubstring += character }
    else {
      pushBufferedSubstring()
      returned.push(character) } }

  function resetBuffer() {
    bufferedSubstring = '' }

  function pushBufferedSubstring() {
    if (bufferedSubstring.length > 0) {
      returned.push(bufferedSubstring)
      resetBuffer() } }

  pushBufferedSubstring()

  return returned }
