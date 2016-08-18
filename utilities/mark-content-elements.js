var BLANK = /_{2,}/
var QUOTE = '["\u201c\u201d]'
var TERM = '([A-Za-z0-9][A-Za-z0-9 -\']*[A-Za-z0-9])'
var DEFINITION = new RegExp(QUOTE + TERM + QUOTE)
var USE = new RegExp('<' + TERM + '>')
var REFERENCE = new RegExp('{' + TERM + '}')

module.exports = function (tree, elements) {
  var namespaces = findTermsAndHeadings(tree)
  // Check for definitions and angle-bracket uses first, since we will
  // want to mark any uses of the same terms in the new content later.
  var withDefinitions = elements.reduce(function (returned, element) {
    if (typeof element === 'string') {
      var results = [element]
      var addTerm = function (term) {
        pushIfMissing(namespaces.terms, term)
      }
      markOccurrences(results, DEFINITION, 'definition', addTerm)
      markOccurrences(results, USE, 'use', addTerm)
      markOccurrences(results, REFERENCE, 'reference')
      return returned.concat(results)
    } else {
      return returned.concat(element)
    }
  }, [])

  // Keep terms sorted.
  namespaces.terms.sort(fromLongestToShortest)

  // Mark blanks, term uses, and heading references.
  return withDefinitions.reduce(function (returned, element) {
    if (typeof element === 'string') {
      var results = [element]
      markOccurrences(results, BLANK, {blank: ''})
      namespaces.terms.forEach(function (term) {
        markOccurrences(results, term, 'use')
      })
      namespaces.headings.forEach(function (term) {
        markOccurrences(results, term, 'reference')
      })
      return returned.concat(results)
    } else {
      return returned.concat(element)
    }
  }, [])
}

function markOccurrences (elements, pattern, substitute, callback) {
  // Iterate elements.
  var index = 0
  while (index < elements.length) {
    var element = elements[index]
    // Ignore uses, definitions, references, and blanks that have
    // already been marked.
    if (typeof element !== 'string') {
      index += 1
    // Check strings.
    } else {
      var occurrence = occurrenceIn(pattern, element)
      if (!occurrence) {
        index += 1
      } else {
        var elementToInsert
        if (typeof substitute === 'string') {
          elementToInsert = {}
          elementToInsert[substitute] = occurrence.value
        } else {
          elementToInsert = substitute
        }
        // Appears at the beginning of the string.
        if (occurrence.index === 0) {
          elements.splice(index, 1,
            elementToInsert,
            element.substring(occurrence.length)
          )
          index += 1
        // Appears at the end of the string.
        } else if (
          occurrence.index + occurrence.length === element.length
        ) {
          elements.splice(index, 1,
            element.substring(0, occurrence.index),
            elementToInsert
          )
          index += 2
        // Appears in the middle of the string.
        } else {
          elements.splice(index, 1,
            element.substring(0, occurrence.index),
            elementToInsert,
            element.substring(occurrence.index + occurrence.length)
          )
          index += 2
        }
        if (callback) {
          callback(occurrence.value)
        }
      }
    }
  }
}

function findTermsAndHeadings (form) {
  var results = {
    terms: [],
    headings: []
  }
  recurse(form, results)
  // Sort namespaces longest to shortest so we mark uses of the longest
  // possible term.
  results.terms.sort(fromLongestToShortest)
  results.headings.sort(fromLongestToShortest)
  return results

  function recurse (form, results) {
    form.content.forEach(function (element) {
      if (typeof element === 'string') {
        return
      } else if ('reference' in element) {
        pushIfMissing(results.headings, element.reference)
      } else if ('use' in element) {
        pushIfMissing(results.terms, element.use)
      } else if ('definition' in element) {
        pushIfMissing(results.terms, element.definition)
      } else if ('form' in element) {
        if ('heading' in element) {
          pushIfMissing(results.headings, element.heading)
        }
        recurse(element.form, results)
      }
    })
  }
}

function pushIfMissing (array, element) {
  if (array.indexOf(element) === -1) {
    array.push(element)
  }
}

function fromLongestToShortest (a, b) {
  return b.length - a.length
}

function occurrenceIn (thing, string) {
  if (typeof thing === 'string') {
    var index = string.indexOf(thing)
    if (index === -1) {
      return false
    } else {
      return {
        index: index,
        length: thing.length,
        value: thing
      }
    }
  } else /* if RegExp */ {
    var match = thing.exec(string)
    if (match) {
      return {
        index: match.index,
        length: match[0].length,
        value: match[1]
      }
    } else {
      return false
    }
  }
}
