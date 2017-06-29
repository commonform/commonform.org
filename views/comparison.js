var assert = require('assert')
var classnames = require('classnames')
var clone = require('../utilities/clone')
var collapsed = require('../html/collapsed')
var definition = require('./definition')
var group = require('commonform-group-series')
var literal = require('../html/literal')
var predicates = require('commonform-predicate')
var reference = require('./reference')
var use = require('./use')

module.exports = comparison

function comparison (diff) {
  assert(typeof diff === 'object')
  var root = !diff.hasOwnProperty('form')
  var treeLike = root ? diff : diff.form
  var groups = group(clone(treeLike))
  var wrapper
  if (diff.hasOwnProperty('inserted')) {
    wrapper = function (argument) {
      return collapsed`<ins>${argument}</ins>`
    }
  } else if (diff.hasOwnProperty('deleted')) {
    wrapper = function (argument) {
      return collapsed`<del>${argument}</del>`
    }
  } else {
    wrapper = function (argument) {
      return argument
    }
  }
  var conspicuous = treeLike.conspicuous
  var madeConspicuous =
    conspicuous.length === 1 &&
    conspicuous[0].hasOwnProperty('inserted')
  var madeInconspicuous =
    conspicuous.length === 1 &&
    conspicuous[0].hasOwnProperty('deleted')

  var classNames = classnames({
    conspicuous: conspicuous.some(function (element) {
      return !element.hasOwnProperty('deleted')
    })
  })

  return collapsed`
    <section class=${classNames}>
      ${
        wrapper(
          literal`
            <div>
              ${root ? null : collapsed`<a class=sigil>\u00A7</a>`}
              ${
                Array.isArray(diff.heading)
                  ? heading(diff.heading)
                  : null
              }
              ${
                madeInconspicuous
                  ? collapsed`<p class=edit>Made inconspicuous.</p>`
                  : null
              }
              ${
                madeConspicuous
                  ? collapsed`<p class=edit>Made conspicuous.</p>`
                  : null
              }
              ${
                groups.map(function (group) {
                  var renderer = group.type === 'series'
                    ? series
                    : paragraph
                  return renderer(group)
                })
              }
            </div>
          `
        )
      }
    </section>
  `
}

function heading (heading) {
  assert(Array.isArray(heading))
  var joined = heading
    .map(function (word) { return word.word })
    .join('')
  return literal`
    <p class=heading id=${joined}>
      ${heading.map(word)}
    </p>
  `
}

function word (word) {
  assert(typeof word === 'object')
  assert(typeof word.word === 'string')
  if (word.inserted) return collapsed`<ins>${word.word}</ins>`
  else if (word.deleted) return collapsed`<del>${word.word}</del>`
  else return collapsed`<span>${word.word}</span>`
}

function series (data) {
  assert(typeof data === 'object')
  assert(Array.isArray(data.content))
  return data.content.map(function (child) {
    return comparison(child)
  })
}

function paragraph (data) {
  assert(typeof data === 'object')
  assert(Array.isArray(data.content))
  return literal`
    <p class=text>
      ${
        data.content.reduce(function (output, child) {
          var wrapper
          if (child.hasOwnProperty('inserted')) {
            wrapper = function (argument) {
              return collapsed`<ins>${argument}</ins>`
            }
          } else if (child.hasOwnProperty('deleted')) {
            wrapper = function (argument) {
              return collapsed`<del>${argument}</del>`
            }
          } else {
            wrapper = doNotWrap
          }

          if (child.hasOwnProperty('word')) {
            if (wrapper === doNotWrap) {
              var last = output[output.length - 1]
              if (typeof last === 'string') {
                output[output.length - 1] = last + child.word
                return output
              } else {
                return output.concat(child.word)
              }
            } else {
              return output.concat(
                wrapper(collapsed`<span>${child.word}</span>`))
            }
          } else if (predicates.use(child)) {
            return output.concat(wrapper(use(child.use)))
          } else if (predicates.definition(child)) {
            return output.concat(wrapper(definition(child.definition)))
          } else if (predicates.blank(child)) {
            return output.concat(collapsed`<span class=blank></span>`)
          } else if (predicates.reference(child)) {
            return output.concat(reference(child.reference))
          }
        }, [])
      }
    </p>
  `
}

function doNotWrap (argument) {
  return argument
}
