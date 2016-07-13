const html = require('choo/html')
const classnames = require('classnames')
const clone = require('../utilities/clone')
const deepEqual = require('deep-equal')
const definition = require('./definition')
const details = require('./details')
const find = require('array-find')
const get = require('keyarray').get
const group = require('commonform-group-series')
const improvePunctuation = require('../utilities/improve-punctuation')
const input = require('./input')
const predicates = require('commonform-predicate')
const reference = require('./reference')
const replaceUnicode = require('../utilities/replace-unicode')
const use = require('./use')

module.exports = form

function form (form, send) {
  const root = form.path.length === 0
  const formKey = root ? [] : ['form']
  const tree = root ? form.tree : form.tree.form
  const groups = group(clone(tree))
  const isFocused = deepEqual(form.focused, form.path)
  const annotationsHere = get(
    form.annotations,
    formKey.concat('annotations'),
    []
  )
  const classes = classnames({
    conspicuous: 'conspicuous' in tree,
    focused: isFocused
  })

  var offset = 0
  return html`
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
        const result = renderer(groupState, send)
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
  return html`
    <a class=sigil
      onclick=${toggleFocus}
      title="Click to focus.">§</a>
  `
}

function marginalia (tree, path, blanks, annotations, toggleFocus) {
  const hasError = annotations.some((a) => a.level === 'error')
  const hasAnnotation = annotations.some((a) => a.level !== 'error')
  const hasBlank = tree.content.some((element, index) =>
     predicates.blank(element) &&
     !blanks.some((direction) => deepEqual(direction.blank, path.concat('form', 'content', index))))
  return html`
    <aside class=marginalia onclick=${toggleFocus}>
      ${hasError ? html`<a class=flag>\u26A0</a>` : null}
      ${hasAnnotation ? html`<a class=flag>\u2690</a>` : null}
      ${hasBlank ? html`<a class=flag>\u270D</a>` : null}
    </aside>
  `
}

function heading (heading) {
  return html`<p class=heading id="Heading ${heading}">${heading}</p>`
}

function series (state, send) {
  return state.data.content.map(function (child, index) {
    const absoluteIndex = index + state.offset
    const pathSuffix = ['content', absoluteIndex]
    const result = form(
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
  return html`
    <p class=text>
      ${
        state.data.content.map((child, index) => {
          if (predicates.text(child)) {
            return html`<span>${improvePunctuation(child)}</span>`
          } else if (predicates.use(child)) {
            return use(child.use)
          } else if (predicates.definition(child)) {
            return definition(child.definition)
          } else if (predicates.blank(child)) {
            const childPath = state.path.concat(['content', state.offset + index])
            return blank(state.blanks, childPath, send)
          } else if (predicates.reference(child)) {
            return reference(child.reference)
          }
        })
      }
    </p>
  `
}

function blank (blanks, path, send) {
  const direction = find(blanks, (element) => deepEqual(element.blank, path))
  const value = direction ? improvePunctuation(direction.value) : ''
  return input(
    value,
    function (value) { send('form:blank', {path: path, value: replaceUnicode(value)}) },
    function () { send('form:blank', {path: path, value: null}) }
  )
}
