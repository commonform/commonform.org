module.exports = splitStrings

var splitWords = require('./split-words')

function splitStrings(argument) {
  var returned = { }
  returned.content = argument.content
    .reduce(
      function(content, element) {
        if (typeof element === 'string') {
          return content.concat(
            { splits: splitWords(element) }) }
        else if (element.hasOwnProperty('form')) {
          var child = { }
          if (element.hasOwnProperty('heading')) {
            child.heading = element.heading }
          child.form = splitStrings(element.form)
          return content.concat(child) }
        else {
          var clone = JSON.parse(JSON.stringify(element))
          return content.concat(clone) } },
      [ ])
  if (argument.conspicuous) {
    returned.conspicuous = argument.conspicuous }
  return returned }
