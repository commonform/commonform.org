// Tag function for tag templates literals constructing HTML.
// Adds a few semantic niceties:
//
// 1.  Falsey values in expressions don't produce output.
//
// 2.  Array values in expressions get stringified and concatenated.
//
// These make it much more convenient do achieve conditional markup
// using boolean expressions, without control structures.
module.exports = function html (/* strings, values... */) {
  var strings = arguments[0]
  var values = Array.prototype.slice.call(arguments, 1)
  var result = ''
  strings.forEach(function (string, index) {
    result += string
    if (index < values.length) {
      result += toString(values[index])
    }
  })
  // Trim so that the newline after the opening backtick and first
  // expression loading the header with <!doctype html> ends up on the
  // first line.
  return result.trim()
}

function toString (value) {
  /* istanbul ignore else */
  if (value === false || value === undefined || value === null) {
    return ''
  } else if (Array.isArray(value)) {
    return value.join('')
  } else if (typeof value === 'string') {
    return value
  } else {
    throw new Error(
      'Invalid template value ' + typeof value + JSON.stringify(value)
    )
  }
}
