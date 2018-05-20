var htmlEntities = require('html-entities').XmlEntities

module.exports = function escape (string) {
  return htmlEntities.encodeNonUTF(string)
}
