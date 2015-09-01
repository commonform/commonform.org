function isString(argument) {
  return (typeof argument === 'string' ) }

function combineStrings(form) {
  form.content = form.content
    .reduce(
      function(combined, element, index) {
        if (index === 0) {
          combined.push(element) }
        else {
          var last = combined[combined.length - 1]
          if (isString(element) && isString(last)) {
            combined[combined.length - 1] = last + element } }
        return combined },
      [ ])
  return form }

module.exports = combineStrings
