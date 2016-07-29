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

module.exports = function (string) {
  return replacements.reduce(function (returned, replacement) {
    return returned.replace(replacement[0], replacement[1])
  }, string)
}
