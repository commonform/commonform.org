var classnames = require('classnames')
var fixStrings = require('commonform-fix-strings')
var group = require('commonform-group-series')
var keyarrayGet = require('keyarray-get')
var lint = require('commonform-lint')
var merkleize = require('commonform-merkleize')
var morph = require('nanomorph')
var raf = require('nanoraf')
var predicate = require('commonform-predicate')
var samePath = require('commonform-same-path')
var validate = require('commonform-validate')

var state = {
  form: window.form,
  selected: false
}

function computeState () {
  var form = state.form
  fixStrings(form)
  state.tree = merkleize(form)
  state.annotations = lint(form)
}

computeState()

function render () {
  var article = document.createElement('article')
  article.className = 'commonform'
  article.appendChild(renderInterface())
  article.appendChild(renderAnnotationCounts())
  article.appendChild(renderContents(0, [], state.form, state.tree))
  return article
}

function renderAnnotationCounts () {
  var counts = {info: 0, warn: 0, error: 0}
  state.annotations.forEach(function (annotation) {
    counts[annotation.level]++
  })
  var div = document.createElement('div')
  div.className = 'annotationCounts'
  Object.keys(counts).forEach(function (level) {
    var span = document.createElement('span')
    span.className = level
    span.appendChild(document.createTextNode(counts[level]))
    div.appendChild(span)
  })
  return div
}

function renderInterface () {
  var re = /^The term "([^"]+)" is used, but not defined.$/
  var terms = []
  state.annotations.forEach(function (annotation) {
    var match = re.exec(annotation.message)
    if (match && terms.indexOf(match[1]) === -1)  terms.push(match[1])
  })
  var header = document.createElement('header')
  var p = document.createElement('p')
  p.appendChild(document.createTextNode('This form uses, but does not define:'))
  header.appendChild(p)
  var ul = document.createElement('ul')
  terms.forEach(function (term) {
    var li = document.createElement('li')
    li.appendChild(document.createTextNode(term))
    ul.appendChild(li)
  })
  header.appendChild(ul)
  return header
}

function update (message) {
  var action = message.action
  if (action === 'select') {
    state.selected = message.path
  } else if (action === 'delete') {
    let path = message.path
    let parent = parentOfPath(path)
    parent.content.splice(path[path.length - 1], 1)
  } else if (action === 'child') {
    let path = message.path
    let clone = JSON.parse(JSON.stringify(state.form))
    let parent = keyarrayGet(clone, path.slice(0, -2))
    let child = {form: {content: ['...']}}
    parent.content.splice(path[path.length - 1], 0, child)
    if (!validate.form(clone, {allowComponents: true})) return
    state.form = clone
  } else if (action === 'move') {
    let clone = JSON.parse(JSON.stringify(state.form))
    let oldPath = state.selected
    let newPath = message.path
    let moving = keyarrayGet(clone, oldPath)
    let oldParent = keyarrayGet(clone, oldPath.slice(0, -2))
    oldParent.content.splice(oldPath[oldPath.length - 1], 1)
    let newParent = keyarrayGet(clone, newPath.slice(0, -2))
    newParent.content.splice(newPath[newPath.length - 1], 0, moving)
    if (!validate.form(clone, {allowComponents: true})) return
    state.form = clone
    state.selected = newPath
  } else if (action === 'heading') {
    let child = keyarrayGet(state.form, message.path)
    let heading = message.heading
    if (heading) child.heading = heading
    else delete child.heading
  }
  if (!message.doNotComputeState) computeState()
  morph(rendered, render())
}

function renderContents (depth, path, form, tree) {
  var fragment = document.createDocumentFragment()
  var offset = 0
  var groups = group(form)
  if (groups[0].type === 'series') {
    fragment.appendChild(renderDropZone(
      state.selected ? 'move' : 'child',
      path.concat('content', 0)
    ))
  }
  groups.forEach(function (group) {
    if (group.type === 'series') {
      fragment.appendChild(
        renderSeries(depth + 1, offset, path, group, tree)
      )
    } else {
      fragment.appendChild(
        renderParagraph(offset, path, group, tree)
      )
      fragment.appendChild(renderDropZone(
        state.selected ? 'move' : 'child',
        path.concat('content', offset + group.content.length)
      ))
    }
    offset += group.content.length
  })
  return fragment
}

function renderParagraph (offset, path, paragraph, tree, options) {
  var p = document.createElement('p')
  paragraph.content.forEach(function (element) {
    p.appendChild(renderParagraphElement(element))
  })
  return p
}

function renderParagraphElement (element) {
  if (predicate.text(element)) {
    return document.createTextNode(element)
  } else if (predicate.use(element)) {
    var use = document.createElement('span')
    use.className = 'use'
    use.appendChild(document.createTextNode(element.use))
    use.href = `#definition:${encodeURIComponent(element.use)}`
    return use
  } else if (predicate.definition(element)) {
    var definition = document.createElement('dfn')
    definition.appendChild(document.createTextNode(element.definition))
    definition.id = `definition:${encodeURIComponent(element.definition)}`
    return definition
  } else if (predicate.blank(element)) {
    var blank = document.createElement('span')
    blank.className = 'blank'
    return blank
  } else if (predicate.reference(element)) {
    var reference = document.createElement('span')
    reference.className = 'reference'
    reference.appendChild(document.createTextNode(element.reference))
    return reference
  }
}

function renderSeries (depth, offset, path, series, tree) {
  var fragment = document.createDocumentFragment()
  series.content.forEach(function (child, index) {
    var absoluteIndex = index + offset
    var form = child.form
    var childTree = tree.content[offset + index]
    var childPath = path.concat('content', offset + index)
    var section = document.createElement('section')
    var digest = childTree.digest
    section.id = digest
    section.dataset.digest = digest
    var selected = state.selected && samePath(childPath, state.selected)
    section.className = classnames({
      conspicuous: child.conspicuous,
      selected: selected
    })
    var heading = document.createElement('input')
    heading.type = 'text'
    heading.placeholder = 'Add heading here.'
    heading.className = 'heading'
    heading.value = child.heading || ''
    section.appendChild(heading)
    heading.onchange = function (event) {
      update({
        action: 'heading',
        path: childPath,
        heading: event.target.value
      })
    }
    if (!selected) {
      var selectButton = document.createElement('button')
      selectButton.className = 'select'
      selectButton.appendChild(document.createTextNode('Select'))
      selectButton.addEventListener('click', function () {
        update({
          action: 'select',
          path: childPath,
          doNotComputeState: true
        })
      })
      section.appendChild(selectButton)
    }
    var deleteButton = document.createElement('button')
    deleteButton.appendChild(document.createTextNode('Delete'))
    deleteButton.addEventListener('click', function () {
      update({
        action: 'delete',
        path: childPath
      })
    })
    section.appendChild(deleteButton)
    var annotations = state.annotations
      .filter(function (annotation) {
        return samePath(annotation.path.slice(0, -3), childPath)
      })
      .reduce(function deduplicate (annotations, annotation) {
        return annotations.some(function (otherAnnotation) {
          return annotation.message === otherAnnotation.message
        }) ? annotations : annotations.concat(annotation)
      }, [])
    section.dataset.annotations = annotations.length
    if (annotations.length !== 0) {
      var aside = document.createElement('aside')
      aside.className = 'annotations'
      annotations.forEach(function (annotation) {
        var p = document.createElement('p')
        p.className = 'annotation ' + annotation.level
        p.appendChild(document.createTextNode(annotation.message))
        aside.appendChild(p)
      })
      section.appendChild(aside)
    }
    section.appendChild(renderContents(
      depth,
      childPath.concat('form'),
      form,
      childTree
    ))
    fragment.appendChild(section)
    fragment.appendChild(renderDropZone(
      state.selected ? 'move' : 'child',
      path.concat('content', absoluteIndex + 1)
    ))
  })
  return fragment
}

function renderDropZone (effect, path) {
  var button = document.createElement('button')
  var onClick, text
  if (effect === 'child') {
    button.onclick = function () {
      update({action: 'child', path: path})
    }
    button.className = 'child-button'
    button.appendChild(document.createTextNode('Add child here.'))
  } else if (effect === 'move') {
    button.onclick = function (event) {
      update({action: 'move', path: path})
    }
    button.className = 'move-button'
    button.appendChild(document.createTextNode('Move here.'))
  }
  return button
}

function parentOfPath (path) {
  return keyarrayGet(state.form, path.slice(0, -2))
}

var rendered = render()
document.getElementById('editor').appendChild(rendered)
