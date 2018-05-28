var classnames = require('classnames')
var editionLink = require('./edition-link')
var escape = require('../../util/escape')
var group = require('commonform-group-series')
var html = require('../html')
var merkleize = require('commonform-merkleize')
var predicate = require('commonform-predicate')
var projectLink = require('./project-link')
var publisherLink = require('./publisher-link')
var samePath = require('commonform-same-path')

module.exports = function (form, loaded, options) {
  options = options || {}
  if (!options.mappings) options.mappings = []
  if (!options.annotations) options.annotations = []
  var tree = options.tree = merkleize(loaded.form)
  return html`
    ${renderTableOfContents(form)}
    <article class=commonform>
      ${renderForm(0, [], form, loaded.form, tree, loaded.resolutions, options)}
    </article>
    ${scriptTag(form, loaded, options)}
  `
}

function renderTableOfContents (form) {
  if (!containsHeading(form)) return ''
  return html`<header class=toc>
    <h2>Table of Contents</h2>
    ${renderContents(form)}
  </header>`
}

function renderContents (form) {
  if (!containsHeading(form)) return ''
  return html`
    <ol class=toc id=toc>
      ${form.content.reduce(function (items, element) {
        if (!element.hasOwnProperty('form')) return items
        var hasHeading = (
          element.hasOwnProperty('heading') ||
          containsHeading(element.form)
        )
        if (!hasHeading) return items
        var li = '<li>'
        if (element.hasOwnProperty('heading')) {
          li += renderReference(element.heading)
        } else {
          li += '(No Heading)'
        }
        li += renderContents(element.form)
        li += '</li>'
        return items.concat(li)
      }, [])}
    </ol>
  `
}

function containsHeading (form) {
  return form.content.some(function (element) {
    return (
      element.hasOwnProperty('form') &&
      (
        element.hasOwnProperty('heading') ||
        containsHeading(element.form)
      )
    )
  })
}

function renderForm (depth, path, form, loaded, tree, resolutions, options) {
  var offset = 0
  var annotationsHere = options.annotations.filter(function (annotation) {
    return samePath(annotation.path, path)
  })
  var formGroups = form && group(form)
  var loadedGroups = group(loaded)
    .map(function (loadedGroup, index) {
      var formGroup = formGroups && formGroups[index]
      var returned = loadedGroup.type === 'series'
        ? renderSeries(
          depth + 1,
          offset,
          path,
          formGroup,
          loadedGroup,
          tree,
          resolutions,
          options
        )
        : renderParagraph(offset, path, loadedGroup, tree, options)
      offset += loadedGroup.content.length
      return returned
    })
    .join('')
  return html`${renderMarginalia(annotationsHere)}${loadedGroups}`
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

function renderSeries (depth, offset, path, formSeries, loadedSeries, tree, resolutions, options) {
  return loadedSeries.content
    .map(function (loadedChild, index) {
      var loadedForm = loadedChild.form
      var childTree = tree.content[offset + index]
      var digest = childTree.digest
      var childPath = path.concat('content', offset + index)
      var resolution = resolutions.find(function (element) {
        return samePath(element.path, childPath)
      })
      var component = resolution && formSeries && formSeries.content[index]
      var classes = classnames({
        conspicuous: loadedForm.conspicuous,
        component: resolution
      })
      return (
        `<section class="${classes}">` +
        ('heading' in loadedChild ? renderHeading(depth, loadedChild.heading) : '') +
        (resolution ? renderComponentInfo(component, resolution) : '') +
        (
          options.childLinks
            ? `<a class=child-link href=/forms/${digest}>${digest}</a>`
            : ''
        ) +
        renderForm(
          depth,
          childPath.concat('form'),
          formSeries ? formSeries.content[index].form : null,
          loadedForm,
          childTree,
          resolutions,
          options
        ) +
        '</section>'
      )
    })
    .join('')
}


function renderComponentInfo (component, resolution) {
  return componentLink(component)
}

function componentLink (component) {
  return `
    ${publisherLink(component.publisher)}’s
    ${projectLink(component)}
    (${editionLink(component)})
  `
}

function renderHeading (depth, heading) {
  return `<h1 class=heading id="heading:${encodeURIComponent(heading)}">${escape(heading)}</h1>`
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
            return `<input type=text class=blank data-path='${blankPath}' value="${escape(value)}" disabled>`
          } else {
            return `<input type=text class=blank data-path='${blankPath}' disabled>`
          }
        } else if (predicate.reference(element)) {
          return renderReference(element.reference)
        }
      })
      .join('') +
    '</p>'
  )
}

function renderReference (heading) {
  return `<a class=reference href="#heading:${encodeURIComponent(heading)}">${escape(heading)}</a>`
}

function matchingValue (path, mappings) {
  var length = mappings.length
  for (var index = 0; index < length; index++) {
    var mapping = mappings[index]
    if (samePath(mapping.blank, path)) return mapping.value
  }
}

function scriptTag (form, loaded, options) {
  return `
    <script>window.form = ${JSON.stringify(form)}</script>
    <script>window.loaded = ${JSON.stringify(loaded)}</script>
    <script>window.mappings = ${JSON.stringify(options.mappings)}</script>
    <script>window.annotations = ${JSON.stringify(options.annotations)}</script>
    <script>window.tree = ${JSON.stringify(options.tree)}</script>
  `
}
