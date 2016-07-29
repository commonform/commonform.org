const LEFT_DOUBLE = '“'
const RIGHT_DOUBLE = '”'
const RIGHT_SINGLE = '’'

const replacements = [
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
