var escape = require('../../util/escape')
var group = require('commonform-group-series')
var html = require('../html')
var merkleize = require('commonform-merkleize')
var predicate = require('commonform-predicate')
var samePath = require('commonform-same-path')

module.exports = function (form, options) {
  options = options || {}
  if (!options.mappings) options.mappings = []
  if (!options.annotations) options.annotations = []
  var tree = options.tree = merkleize(form)
  return html`
    ${renderForm(0, [], form, tree, options)}
    ${scriptTag(form, options)}
  `
}

function renderForm (depth, path, form, tree, options) {
  var offset = 0
  var annotationsHere = options.annotations.filter(function (annotation) {
    return samePath(annotation.path, path)
  })
  var groups = group(form)
    .map(function (group) {
      var returned = group.type === 'series'
        ? renderSeries(depth + 1, offset, path, group, tree, options)
        : renderParagraph(offset, path, group, tree, options)
      offset += group.content.length
      return returned
    })
    .join('')
  return html`${renderMarginalia(annotationsHere)}${groups}`
}

function renderMarginalia (annotations) {
  if (annotations.length === 0) return ''
  return annotations.map(function (annotation) {
    var classes = 'annotation ' + annotation.level
    return html`
      <aside class="${classes}">
        <p>${escape(annotation.message)}</p>
      </aside>
    `
  })
}

function renderSeries (depth, offset, path, series, tree, options) {
  return series.content
    .map(function (child, index) {
      var form = child.form
      var childTree = tree.content[offset + index]
      var digest = childTree.digest
      return (
        (form.conspicuous ? '<section class=conspicuous>' : '<section>') +
        ('heading' in child ? renderHeading(depth, child.heading) : '') +
        (
          options.childLinks
            ? `<a class=child-link href=/forms/${digest}>${digest}</a>`
            : ''
        ) +
        renderForm(
          depth,
          path.concat('content', offset + index, 'form'),
          form,
          childTree,
          options
        ) +
        '</section>'
      )
    })
    .join('')
}

function renderHeading (depth, heading) {
  return `<h1 id="heading:${encodeURIComponent(heading)}">${escape(heading)}</h1>`
}

function renderParagraph (offset, path, paragraph, tree, options) {
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
          let value = matchingValue(blankPath, options.mappings)
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

function scriptTag (form, options) {
  return `
    <script>window.form = ${JSON.stringify(form)}</script>
    <script>window.mappings = ${JSON.stringify(options.mappings)}</script>
    <script>window.annotations = ${JSON.stringify(options.annotations)}</script>
    <script>window.tree = ${JSON.stringify(options.tree)}</script>
  `
}
