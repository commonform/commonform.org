var predicate = require('commonform-predicate')

function headingsTree(merkle, form) {
  return form.content
    .reduce(
      function(result, element, index) {
        if (predicate.child(element)) {
          var object = { }
          if ('heading' in element) {
            object.heading = element.heading }
          object.digest = merkle.content[index].digest
          object.content = headingsTree(
            merkle.content[index],
            element.form)
          result[index] = object }
        return result },
      { })}

module.exports = headingsTree
