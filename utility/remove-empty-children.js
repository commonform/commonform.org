module.exports = removeEmptyChildren

function removeEmptyChildren(form) {
  form.content.reduce(
    function(empty, element, index) {
      var isChild = ( typeof element === 'object' && 'form' in element )
      if (isChild) {
        if (element.form.content.length === 0) {
          empty.unshift(index) }
        else {
          removeEmptyChildren(element.form) } }
      return empty },
    [ ])
    .forEach(function(index) {
      form.content.splice(index, 1) }) }
