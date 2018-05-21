var escape = require('../../util/escape')
var group = require('commonform-group-series')
var predicate = require('commonform-predicate')

module.exports = function (form, mappings) {
  return renderForm(0, [], form, mappings)
}

function renderForm (depth, path, form, mappings) {
  var offset = 0
  return group(form)
    .map(function (group) {
      var returned = group.type === 'series'
        ? renderSeries(depth + 1, offset, path, group, mappings)
        : renderParagraph(offset, path, group, mappings)
      offset += group.content.length
      return returned
    })
    .join('')
}

function renderSeries (depth, offset, path, series, mappings) {
  return series.content
    .map(function (child, index) {
      var form = child.form
      return (
        (form.conspicuous ? '<section class=conspicuous>' : '<section>') +
        ('heading' in child ? renderHeading(depth, child.heading) : '') +
        renderForm(
          depth,
          path.concat('content', offset + index, 'form'),
          form,
          mappings
        ) +
        '</section>'
      )
    })
    .join('')
}

function renderHeading (depth, heading) {
  return '<h1>' + escape(heading) + '</h1>'
}

function renderParagraph (offset, path, paragraph, mappings) {
  return (
    '<p>' +
    paragraph.content
      .map(function (element, index) {
        if (predicate.text(element)) {
          return escape(element)
        } else if (predicate.use(element)) {
          return `<span class=use>${escape(element.use)}</span>`
        } else if (predicate.definition(element)) {
          return `<dfn>${escape(element.definition)}</dfn>`
        } else if (predicate.blank(element)) {
          var blankPath = JSON.stringify(path.concat('content', offset + index))
          var value = matchingValue(blankPath, mappings)
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
