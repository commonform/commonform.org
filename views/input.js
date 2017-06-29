module.exports = function input (value, set, clear, placeholder) {
  if (value && value.length > 0) {
    var span = document.createElement('span')
    span.className = 'blank'
    span.appendChild(document.createTextNode(value))
    var a = document.createElement('a')
    a.className = 'clear'
    a.title = 'Clear'
    a.onclick = function (event) {
      event.preventDefault()
      clear()
    }
    span.appendChild(a)
    return span
  } else {
    var input = document.createElement('input')
    input.className = 'blank'
    if (placeholder) {
      input.setAttribute('placeholder', placeholder)
    }
    input.onchange = function (event) {
      event.preventDefault()
      set(event.target.value)
    }
    return input
  }
}
