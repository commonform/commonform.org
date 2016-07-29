var equivalents = require('unicode-ascii-equivalents')

module.exports = function (string) {
  return equivalents.reduce(function (returned, equivalence) {
    return returned
    .split(equivalence.unicode)
    .join(equivalence.ascii)
  }, string)
}
