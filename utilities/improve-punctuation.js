var LEFT_DOUBLE = '“'
var RIGHT_DOUBLE = '”'
var RIGHT_SINGLE = '’'

var replacements = [
  [/^"/g, LEFT_DOUBLE],
  [/"$/g, RIGHT_DOUBLE],
  [/ "/g, ' ' + LEFT_DOUBLE],
  [/"/g, RIGHT_DOUBLE],
  [/'/g, RIGHT_SINGLE]
]

module.exports = function improvePunctuation (string) {
  for (var index = 0; index < replacements.length; index++) {
    var replacement = replacements[index]
    string.replace(replacement[0], replacement[1])
  }
  return string
}
