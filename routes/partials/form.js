var escape = require('../../util/escape')
var group = require('commonform-group-series')
var merkleize = require('commonform-merkleize')
var predicate = require('commonform-predicate')

module.exports = function (form, mappings) {
  return renderForm(0, [], form, mappings, merkleize(form))
}

function renderForm (depth, path, form, mappings, tree) {
  var offset = 0
  return group(form)
    .map(function (group) {
      var returned = group.type === 'series'
        ? renderSeries(depth + 1, offset, path, group, mappings, tree)
        : renderParagraph(offset, path, group, mappings, tree)
      offset += group.content.length
      return returned
    })
    .join('')
}

function renderSeries (depth, offset, path, series, mappings, tree) {
  return series.content
    .map(function (child, index) {
      var form = child.form
      var childTree = tree.content[offset + index]
      var digest = childTree.digest
      return (
        (form.conspicuous ? '<section class=conspicuous>' : '<section>') +
        ('heading' in child ? renderHeading(depth, child.heading) : '') +
        (`<a class=child-link href=/forms/${digest}>${digest}</a>`) +
        renderForm(
          depth,
          path.concat('content', offset + index, 'form'),
          form,
          mappings,
          childTree
        ) +
        '</section>'
      )
    })
    .join('')
}

function renderHeading (depth, heading) {
  return `<h1 id="heading:${encodeURIComponent(heading)}">${escape(heading)}</h1>`
}

function renderParagraph (offset, path, paragraph, mappings, tree) {
  return (
    '<p>' +
    paragraph.content
      .map(function (element, index) {
        if (predicate.text(element)) {
          return escape(element)
        } else if (predicate.use(element)) {
          let term = element.use
          let href = `#definition:${encodeURIComponent(term)}`
          return `<a class=use href="${href}">${escape(term)}</a>`
        } else if (predicate.definition(element)) {
          let term = element.definition
          let id = `definition:${encodeURIComponent(term)}`
          return `<dfn id="${id}">${escape(term)}</dfn>`
        } else if (predicate.blank(element)) {
          let blankPath = JSON.stringify(path.concat('content', offset + index))
          let value = matchingValue(blankPath, mappings)
          if (value) {
            return `<input type=text class=blank data-path='${blankPath}' value="${escape(value)}">`
          } else {
            return `<input type=text class=blank data-path='${blankPath}'>`
          }
        } else if (predicate.reference(element)) {
          var heading = element.reference
          return `<a href="#heading:${encodeURIComponent(heading)}">${escape(heading)}</a>`
        }
      })
      .join('') +
    '</p>'
  )
}

function matchingValue (path, mappings) {
  var length = mappings.length
  for (var index = 0; index < length; index++) {
    var mapping = mappings[index]
    if (samePath(mapping.blank, path)) return mapping.value
  }
}

function samePath (a, b) {
  return (
    Array.isArray(a) &&
    Array.isArray(b) &&
    a.length === b.length &&
    a.every(function (_, index) {
      return a[index] === b[index]
    })
  )
}
