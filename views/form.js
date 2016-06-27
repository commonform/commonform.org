var choo = require('choo')
var classnames = require('classnames')
var clone = require('../clone')
var deepEqual = require('deep-equal')
var find = require('array-find')
var get = require('keyarray').get
var group = require('commonform-group-series')
var improvePunctuation = require('../improve-punctuation')
var predicates = require('commonform-predicate')
var replaceUnicode = require('../replace-unicode')

var details = require('./details')
var input = require('./input')

module.exports = form

function form (form, send) {
  var root = form.path.length === 0
  var formKey = root ? [] : ['form']
  var tree = root ? form.tree : form.tree.form
  var groups = group(clone(tree))
  var isFocused = deepEqual(form.focused, form.path)
  var annotationsHere = get(
    form.annotations,
    formKey.concat('annotations'),
    []
  )
  var classes = classnames({
    conspicuous: 'conspicuous' in tree,
    focused: isFocused
  })

  var offset = 0
  return choo.view`
    <section class="${classes}" data-digest="${form.merkle.digest}">
      ${root ? null : sectionButton(toggleFocus)}
      ${form.tree.heading ? heading(form.tree.heading) : null}
      ${isFocused ? details(form.merkle.digest, annotationsHere, send) : null}
      ${marginalia(tree, form.path, form.blanks, annotationsHere, toggleFocus)}
      ${groups.map(function (group) {
        var groupState = {
          blanks: form.blanks,
          data: group,
          annotations: get(form.annotations, formKey, {}),
          focused: form.focused,
          offset: offset,
          path: form.path.concat(formKey)
        }
        var renderer
        if (group.type === 'series') {
          renderer = series
          groupState.merkle = form.merkle
        } else renderer = paragraph
        var result = renderer(groupState, send)
        offset += group.content.length
        return result
      })}
    </section>
  `

  function toggleFocus (event) {
    event.stopPropagation()
    send('form:focus', {path: isFocused ? null : form.path})
  }
}

function sectionButton (toggleFocus) {
  return choo.view`
    <a class=sigil
      onclick=${toggleFocus}
      title="Click to focus.">§</a>
  `
}

function marginalia (tree, path, blanks, annotations, toggleFocus) {
  var hasError = annotations.some((a) => a.level === 'error')
  var hasAnnotation = annotations.some((a) => a.level !== 'error')
  var hasBlank = tree.content.some((element, index) =>
     predicates.blank(element) &&
     !blanks.some((direction) => deepEqual(direction.blank, path.concat('form', 'content', index))))
  return choo.view`
    <aside class=marginalia onclick=${toggleFocus}>
      ${hasError ? choo.view`<a class=flag>\u26A0</a>` : null}
      ${hasAnnotation ? choo.view`<a class=flag>\u2690</a>` : null}
      ${hasBlank ? choo.view`<a class=flag>\u270D</a>` : null}
    </aside>
  `
}

function heading (heading) {
  return choo.view`<p class=heading id="Heading ${heading}">${heading}</p>`
}

function series (state, send) {
  return state.data.content.map(function (child, index) {
    var absoluteIndex = index + state.offset
    var pathSuffix = ['content', absoluteIndex]
    var result = form(
      {
        blanks: state.blanks,
        tree: child,
        annotations: get(state.annotations, ['content', absoluteIndex], {}),
        merkle: state.merkle.content[absoluteIndex],
        focused: state.focused,
        path: state.path.concat(pathSuffix)
      },
      send
    )
    return result
  })
}

function paragraph (state, send) {
  return choo.view`
    <p class=text>
      ${state.data.content.map(function (child, index) {
        if (predicates.text(child)) {
          return choo.view`<span>${improvePunctuation(child)}</span>`
        } else if (predicates.use(child)) {
          return choo.view`
            <a  class=use
                title="Jump to definition of ${child.use}"
                href="#Definition ${child.user}"
              >${child.use}</a>
          `
        } else if (predicates.definition(child)) {
          return choo.view`
            <dfn
                id="Definition of ${child.definition}"
                title="Definition of ${child.definition}"o
              >${child.definition}</dfn>
          `
        } else if (predicates.blank(child)) {
          var childPath = state.path.concat(['content', state.offset + index])
          return blank(state.blanks, childPath, send)
        } else if (predicates.reference(child)) {
          var heading = child.reference
          return choo.view`
            <a  class=reference
                title="Jump to ${heading}"
                href="#Heading ${heading}"
                >${heading}</a>` } })}</p>
  `
}

function blank (blanks, path, send) {
  var direction = find(blanks, (element) => deepEqual(element.blank, path))
  var value = direction ? improvePunctuation(direction.value) : ''
  return input(
    value,
    function (value) { send('form:blank', {path: path, value: replaceUnicode(value)}) },
    function () { send('form:blank', {path: path, value: null}) }
  )
}
