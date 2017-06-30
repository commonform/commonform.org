var assert = require('assert')
var classnames = require('classnames')
var clone = require('../utilities/clone')
var definition = require('./definition')
var group = require('commonform-group-series')
var h = require('../h')
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
      return h('ins', argument)
    }
  } else if (diff.hasOwnProperty('deleted')) {
    wrapper = function (argument) {
      return h('del', argument)
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

  return h('section.' + classNames,
    wrapper(
      h('div', [
        root ? null : h('a.sigil', '\u00A7'),
        Array.isArray(diff.heading)
          ? heading(diff.heading)
          : null,
        madeInconspicuous ? h('p.edit', 'Made inconspicuous') : null,
        madeConspicuous ? h('p.edit', 'Made conspicuous') : null,
        groups.map(function (group) {
          var renderer = group.type === 'series'
            ? series
            : paragraph
          return renderer(group)
        })
      ])
    )
  )
}

function heading (heading) {
  assert(Array.isArray(heading))
  var joined = heading
    .map(function (word) { return word.word })
    .join('')
  return h('p.heading#' + joined, heading.map(word))
}

function word (word) {
  assert(typeof word === 'object')
  assert(typeof word.word === 'string')
  if (word.inserted) return h('ins', word.word)
  else if (word.deleted) return h('del', word.word)
  else return h('span', word.word)
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
  return h('p.text', data.content.reduce(function (output, child) {
    var wrapper
    if (child.hasOwnProperty('inserted')) {
      wrapper = function (argument) {
        return h('ins', argument)
      }
    } else if (child.hasOwnProperty('deleted')) {
      wrapper = function (argument) {
        return h('del', argument)
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
        return output.concat(wrapper(h('span', child.word)))
      }
    } else if (predicates.use(child)) {
      return output.concat(wrapper(use(child.use)))
    } else if (predicates.definition(child)) {
      return output.concat(wrapper(definition(child.definition)))
    } else if (predicates.blank(child)) {
      return output.concat(h('span.blank'))
    } else if (predicates.reference(child)) {
      return output.concat(reference(child.reference))
    }
  }, []))
}

function doNotWrap (argument) {
  return argument
}
