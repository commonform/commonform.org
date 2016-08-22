module.exports = function fromElements (elements, names) {
  var returned = {}
  names.forEach(function (name) {
    returned[name] = elements[name].value
    elements[name].value = ''
  })
  return returned
}
