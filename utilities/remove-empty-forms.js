module.exports = function removeEmptyForms (tree) {
  var completelyEmpty = recurse(tree)
  if (completelyEmpty) {
    tree.content.push({
      form: {
        content: ['...']
      }
    })
  }
  return tree
}

function recurse (tree) {
  if (tree.content.length === 0) {
    return true
  } else {
    var emptyChildren = []
    tree.content.forEach(function (element, index) {
      var isChild = (
        typeof element === 'object' &&
        element.hasOwnProperty('form')
      )
      if (isChild && recurse(element.form)) {
        emptyChildren.push(index)
      }
    })
    if (emptyChildren.length === tree.content.length) {
      return true
    } else {
      emptyChildren.reverse().forEach(function (index) {
        tree.content.splice(index, 1)
      })
    }
  }
}
