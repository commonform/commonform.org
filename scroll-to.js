function elementWithData(property, value) {
  return document.querySelectorAll(
    '[data-' + property + '=' + JSON.stringify(value) + ']') }

function scrollTo(property, value, index) {
  if (index === undefined) {
    index = 0 }
  elementWithData(property, value)[index].scrollIntoView() }

module.exports = scrollTo
