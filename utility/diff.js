module.exports = diff

var diffJSON = require('rfc6902-json-diff')
var jsonpointer = require('json-pointer')
var treeify = require('commonform-treeify-annotations')

function diff(a, b) {
  return treeify(
    diffJSON(a, b)
      .reduce(
        function(result, element) {
          var path = jsonpointer.parse(element.path)
          if (element.op === 'replace') {
            return result.concat(
              { op: 'remove',
                path: path },
              { op: 'add',
                path: path,
                value: element.value }) }
          else {
            element.path = path
            return result.concat(path) } },
        [ ])) }
