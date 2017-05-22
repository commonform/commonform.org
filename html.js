var hx = require('hyperx')

var BOOLEAN_PROPERTIES = [
  'autofocus',
  'checked',
  'defaultchecked',
  'disabled',
  'formnovalidate',
  'indeterminate',
  'readonly',
  'required',
  'selected',
  'willvalidate'
]

module.exports = hx(function (tag, properties, children) {
  var element = document.createElement(tag)
  for (var property in properties) {
    var value = properties[property]
    var lowercase = property.toLowerCase()
    if (lowercase === 'classname') {
      property = 'class'
    } else if (BOOLEAN_PROPERTIES.indexOf(lowercase) !== -1) {
      if (value === 'true') {
        value = lowercase
      } else if (value === 'false') {
        continue
      }
    }
    if (property.slice(0, 2) === 'on') {
      element[property] = value
    } else {
      element.setAttribute(property, value)
    }
  }
  appendChildren(element, children)
  return element
})

function appendChildren (element, children) {
  if (Array.isArray(children)) {
    children.forEach(function (child) {
      if (Array.isArray(child)) {
        appendChildren(element, child)
      } else {
        var type = typeof child
        var needToStringify = (
          type === 'number' ||
          type === 'boolean' ||
          type === 'function'
        )
        if (needToStringify) {
          child = child.toString()
        }
        if (needToStringify || typeof child === 'string') {
          element.appendChild(document.createTextNode(child))
        } else if (child && child.nodeType) {
          element.appendChild(child)
        }
      }
    })
  }
}
