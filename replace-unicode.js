module.exports = replaceUnicode

var equivalents = require('unicode-ascii-equivalents')

function replaceUnicode(string) {
  return equivalents
    .reduce(
      function(returned, equivalence) {
        return returned
          .split(equivalence.unicode)
          .join(equivalence.ascii) },
      string) }
