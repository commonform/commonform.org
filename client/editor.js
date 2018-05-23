/* eslint-env browser */
var analyze = require('commonform-analyze')
var classnames = require('classnames')
var fixStrings = require('commonform-fix-strings')
var group = require('commonform-group-series')
var keyarrayGet = require('keyarray-get')
var loadComponents = require('commonform-load-components')
var merkleize = require('commonform-merkleize')
var morph = require('nanomorph')
var parse = require('commonform-markup-parse')
var predicate = require('commonform-predicate')
var runParallel = require('run-parallel')
var samePath = require('commonform-same-path')
var validate = require('commonform-validate')

var annotators = [
  {name: 'structural errors', annotator: require('commonform-lint')},
  {name: 'archaisms', annotator: require('commonform-archaic')},
  {name: 'wordiness', annotator: require('commonform-wordy')},
  {name: 'MSCD', annotator: require('commonform-mscd')}
]

var state = {
  form: window.form,
  selected: false,
  annotators: [annotators[0].annotator]
}

function computeState (done) {
  var form = state.form
  fixStrings(form)
  state.tree = merkleize(form)
  state.annotations = state.annotators
    .reduce(function (annotations, annotator) {
      return annotations.concat(annotator(form))
    }, [])
  state.analysis = analyze(form)
  // Load each component in the form.
  // Note that we do _not_ run `loadComponents` on the form as a whole.
  // That would replace terms and references according to substitutions
  // specified in the components objects.  We need to know what terms
  // and headings need to be replaced to present UI.
  runParallel(
    state.analysis.components.map(function (entry) {
      var component = entry[0]
      return function (done) {
        // TODO: Fetch latest upgrade.
        fetch(
          'https://' + component.repository +
          '/publishers/' + encodeURIComponent(component.publisher) +
          '/projects/' + encodeURIComponent(component.project) +
          '/publications/' + encodeURIComponent(component.edition)
        )
          .then(function (response) {
            return response.json()
          })
          .then(function (publication) {
            return fetch(
              'https://' + component.repository +
              '/forms/' + publication.digest
            )
          })
          .then(function (response) {
            return response.json()
          })
          .then(function (form) {
            loadComponents(form, {}, function (error, loaded) {
              if (error) return done(error)
              done(null, {component, loaded})
            })
          })
          .catch(done)
      }
    }),
    function (error, components) {
      if (error) state.components = false
      else state.components = components
      done()
    }
  )
}

function render () {
  var article = document.createElement('article')
  article.className = 'commonform'
  article.appendChild(renderOptions())
  article.appendChild(renderInterface())
  article.appendChild(renderAnnotationCounts())
  article.appendChild(renderContents(0, [], state.form, state.tree))
  return article
}

function renderOptions () {
  var div = document.createElement('div')
  var p = document.createElement('p')
  p.appendChild(document.createTextNode('Check For:'))
  div.appendChild(p)
  annotators.forEach(function (element, index) {
    var label = document.createElement('label')
    label.id = 'toggle-annotator-' + index
    var input = document.createElement('input')
    input.type = 'checkbox'
    input.onchange = function () {
      update({action: 'toggle annotator', annotator: element})
    }
    if (state.annotators.indexOf(element.annotator) !== -1) {
      input.checked = true
    }
    label.appendChild(input)
    label.appendChild(document.createTextNode(element.name))
    p.appendChild(label)
  })
  return div
}

function renderAnnotationCounts () {
  var counts = {info: 0, warn: 0, error: 0}
  state.annotations.forEach(function (annotation) {
    counts[annotation.level]++
  })
  var div = document.createElement('div')
  div.className = 'annotationCounts'
  Object.keys(counts).forEach(function (level) {
    var a = document.createElement('a')
    a.className = level + ' count'
    a.appendChild(document.createTextNode(counts[level]))
    div.appendChild(a)
    if (counts[level] !== 0) {
      a.title = 'Jump to first ' + level + ' annotation.'
      a.onclick = function () {
        document.getElementsByClassName(level)[1].scrollIntoView()
      }
    }
  })
  return div
}

function renderInterface () {
  var re = /^The term "([^"]+)" is used, but not defined.$/
  var terms = []
  state.annotations.forEach(function (annotation) {
    var match = re.exec(annotation.message)
    if (match && terms.indexOf(match[1]) === -1) terms.push(match[1])
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
  } else if (action === 'deselect') {
    state.selected = false
  } else if (action === 'delete') {
    let path = message.path
    let parent = parentOfPath(path)
    parent.content.splice(path[path.length - 1], 1)
    state.selected = false
  } else if (action === 'child') {
    let path = message.path
    let clone = JSON.parse(JSON.stringify(state.form))
    let parent = keyarrayGet(clone, path.slice(0, -2))
    let child = {form: {content: ['...']}}
    parent.content.splice(path[path.length - 1], 0, child)
    if (!validate.form(clone, {allowComponents: true})) return
    state.form = clone
    state.selected = path
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
  } else if (action === 'content') {
    let path = message.path
    let markup = message.markup
    let offset = message.offset
    let length = message.length
    let clone = JSON.parse(JSON.stringify(state.form))
    let contentArray = keyarrayGet(clone, path).content
    try {
      var parsed = parse(markup).form.content
    } catch (error) {
      renderAndMorph()
      return
    }
    var spliceArguments = [offset, length].concat(parsed)
    contentArray.splice.apply(contentArray, spliceArguments)
    if (!validate.form(clone, {allowComponents: true})) return
    state.form = clone
  } else if (action === 'toggle annotator') {
    var annotator = message.annotator.annotator
    var index = state.annotators.indexOf(annotator)
    if (index === -1) state.annotators.push(annotator)
    else state.annotators.splice(index, 1)
  } else if (action === 'toggle conspicuous') {
    let path = message.path
    let child = keyarrayGet(state.form, path)
    if (child.conspicuous) delete child.conspicuous
    else child.conspicuous = 'yes'
  } else if (action === 'toggle update') {
    let path = message.path
    let component = keyarrayGet(state.form, path)
    if (component.upgrade) delete component.upgrade
    else component.upgrade = 'yes'
  } else if (action === 'substitute term') {
    let path = message.path
    let component = keyarrayGet(state.form, path)
    let original = message.original
    let substituted = message.substituted
    if (substituted.length === 0) {
      delete component.substitutions.terms[original]
    } else {
      component.substitutions.terms[original] = substituted
    }
  } else if (action === 'replace with component') {
    let path = message.path
    let child = keyarrayGet(state.form, path)
    let component = {
      repository: 'api.commonform.org',
      publisher: 'kemitchell',
      project: 'placeholder-component',
      edition: '1e',
      substitutions: {terms: {}, headings: {}}
    }
    if (child.heading) component.heading = child.heading
    let parent = parentOfPath(path)
    parent.content.splice(path[path.length - 1], 1, component)
  }
  if (!message.doNotComputeState) {
    fixSubstitutions()
    computeState(renderAndMorph)
  } else {
    setImmediate(renderAndMorph)
  }
  function renderAndMorph () {
    morph(rendered, render())
  }
}

function fixSubstitutions () {
  var analysis = analyze(state.form)
  var definitions = Object.keys(analysis.definitions)
  var headings = Object.keys(analysis.headings)
  function recurse (form) {
    form.content.forEach(function (element) {
      if (element.hasOwnProperty('repository')) {
        var component = element
        var substitutions = component.substitutions
        var terms = substitutions.terms
        Object.keys(terms).forEach(function (original) {
          var substituted = terms[original]
          if (!definitions.includes(substituted)) {
            delete terms[original]
          }
        })
        var references = substitutions.headings
        Object.keys(references).forEach(function (referenced) {
          if (!headings.includes(references[referenced])) {
            delete headings[referenced]
          }
        })
      } else if (element.hasOwnProperty('form')) {
        recurse(element.form)
      }
    })
  }
  recurse(state.form)
}

function renderComponent (component, path) {
  var loaded = state.components.find(function (pair) {
    var other = pair.component
    return (
      other.repository === component.repository &&
      other.publisher === component.publisher &&
      other.project === component.project &&
      other.edition === component.edition &&
      other.upgrade === component.upgrade
    )
  }).loaded
  var analysis = analyze(loaded)

  var defined = Object.keys(analysis.definitions)
  var used = Object.keys(analysis.uses)
  var termsToDefine = used.filter(function (used) {
    return defined.indexOf(used) === -1
  })

  var referenced = Object.keys(analysis.references)
  var utilized = Object.keys(analysis.headings)
  var headingsToResolve = referenced.filter(function (referenced) {
    return utilized.indexOf(referenced) === -1
  })

  var fragment = document.createDocumentFragment()
  var p = document.createElement('p')

  var publisher = document.createElement('a')
  publisher.href = '/' + encodeURIComponent(component.publisher)
  publisher.target = '_blank'
  publisher.appendChild(document.createTextNode(component.publisher))
  p.appendChild(publisher)
  p.appendChild(document.createTextNode('’s '))

  var project = document.createElement('a')
  project.href = '/' + encodeURIComponent(component.publisher) + '/' + encodeURIComponent(component.project)
  project.target = '_blank'
  project.appendChild(document.createTextNode(component.project))
  p.appendChild(project)

  p.appendChild(document.createTextNode(' '))

  var edition = document.createElement('a')
  edition.href = '/' + encodeURIComponent(component.publisher) + '/' + encodeURIComponent(component.project) + '/' + encodeURIComponent(component.edition)
  edition.target = '_blank'
  edition.appendChild(document.createTextNode(component.edition))
  p.appendChild(edition)

  fragment.appendChild(p)

  var upgradeParagraph = document.createElement('p')
  var upgradeLabel = document.createElement('label')
  var upgradeInput = document.createElement('input')
  upgradeInput.type = 'checkbox'
  upgradeInput.onchange = function () {
    update({
      action: 'toggle update',
      path: path
    })
  }
  upgradeLabel.appendChild(upgradeInput)
  upgradeLabel.appendChild(document.createTextNode('Upgrade Automatically'))
  if (component.upgrade) upgradeInput.checked = true
  upgradeParagraph.appendChild(upgradeLabel)
  fragment.appendChild(upgradeParagraph)

  if (termsToDefine.length !== 0) {
    var terms = document.createElement('ul')
    terms.className = 'substitutions terms'
    termsToDefine
      .sort()
      .forEach(function (original) {
        var substituted = component.substitutions.terms[original]
        var li = document.createElement('li')
        li.appendChild(document.createTextNode(original + ': '))
        var select = document.createElement('select')
        select.onchange = function () {
          update({
            action: 'substitute term',
            path: path,
            original: original,
            substituted: this.value
          })
        }
        Object.keys(state.analysis.definitions).forEach(function (term) {
          var option = document.createElement('option')
          option.value = term
          option.appendChild(document.createTextNode(term))
          if (term === substituted) option.selected = true
          select.appendChild(option)
        })
        var nullOption = document.createElement('option')
        nullOption.value = ''
        nullOption.appendChild(document.createTextNode('(Leave undefined.)'))
        if (substituted === undefined) nullOption.selected = true
        select.appendChild(nullOption)
        li.appendChild(select)
        terms.appendChild(li)
      })
    fragment.appendChild(terms)
  }

  if (headingsToResolve.length !== 0) {
    var headings = document.createElement('ul')
    headings.className = 'substitutions headings'
    headingsToResolve.forEach(function (original) {
      var substituted = component.substitutions.headings[original]
      var li = document.createElement('li')
      li.appendChild(original + '→' + substituted)
      headings.appendChild(li)
    })
    fragment.appendChild(headings)
  }

  return fragment
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

function renderParagraph (offset, path, paragraph, tree) {
  var p = document.createElement('p')
  p.className = 'paragraph'
  p.contentEditable = true
  var originalMarkup = paragraph.content
    .map(renderParagraphElement)
    .join('')
  p.appendChild(document.createTextNode(originalMarkup))
  p.onkeydown = function (event) {
    if (event.which === 13 || event.keyCode === 13) this.blur()
  }
  p.onblur = function () {
    var newMarkup = p.textContent.replace(/[^\x20-\x7E]|\t/g, '')
    if (newMarkup.trim().length === 0) {
      p.textContent = originalMarkup
      return
    }
    if (newMarkup !== originalMarkup) {
      update({
        action: 'content',
        path: path,
        offset: offset,
        length: paragraph.content.length,
        markup: newMarkup
      })
    }
  }
  return p
}

function renderParagraphElement (element) {
  if (predicate.text(element)) {
    return element
  } else if (predicate.use(element)) {
    return '<' + element.use + '>'
  } else if (predicate.definition(element)) {
    return '""' + element.definition + '""'
  } else if (predicate.blank(element)) {
    return '[]'
  } else if (predicate.reference(element)) {
    return '{' + element.reference + '}'
  }
}

function renderSeries (depth, offset, path, series, tree) {
  var fragment = document.createDocumentFragment()
  series.content.forEach(function (child, index) {
    var absoluteIndex = index + offset
    var form = child.form
    var childTree = tree.content && tree.content[offset + index]
    var childPath = path.concat('content', offset + index)
    var section = document.createElement('section')
    if (childTree) {
      var digest = childTree.digest
      section.id = digest
      section.dataset.digest = digest
    }
    var selected = state.selected && samePath(childPath, state.selected)
    var isComponent = child.hasOwnProperty('repository')
    section.className = classnames({
      component: isComponent,
      conspicuous: child.conspicuous,
      selected: selected
    })
    if (child.heading) {
      var heading = document.createElement('h1')
      heading.className = 'heading'
      heading.contentEditable = true
      heading.appendChild(document.createTextNode(child.heading || ''))
      heading.onkeydown = function (event) {
        if (event.which === 13 || event.keyCode === 13) this.blur()
      }
      heading.onblur = function (event) {
        update({
          action: 'heading',
          path: childPath,
          heading: event.target.textContent
        })
      }
      section.appendChild(heading)
    } else {
      var headingButton = document.createElement('button')
      headingButton.appendChild(document.createTextNode('Add Heading'))
      headingButton.onclick = function () {
        update({
          action: 'heading',
          path: childPath,
          heading: 'New Heading'
        })
      }
      section.appendChild(headingButton)
    }
    if (!selected) {
      var selectButton = document.createElement('button')
      selectButton.className = 'select'
      selectButton.appendChild(document.createTextNode('☐'))
      selectButton.title = 'Select.'
      selectButton.onclick = function () {
        update({
          action: 'select',
          path: childPath,
          doNotComputeState: true
        })
      }
      section.appendChild(selectButton)
    } else {
      var deselectButton = document.createElement('button')
      deselectButton.className = 'deselect'
      deselectButton.appendChild(document.createTextNode('☒'))
      deselectButton.title = 'Deselect.'
      deselectButton.onclick = function () {
        update({
          action: 'deselect',
          doNotComputeState: true
        })
      }
      section.appendChild(deselectButton)
    }
    if (!isComponent) {
      var conspicuousButton = document.createElement('button')
      conspicuousButton.appendChild(document.createTextNode('⚠'))
      conspicuousButton.title = 'Toggle conspicuous formatting.'
      conspicuousButton.onclick = function () {
        update({
          action: 'toggle conspicuous',
          path: childPath,
          doNotComputeState: true
        })
      }
      section.appendChild(conspicuousButton)

      var componentButton = document.createElement('button')
      componentButton.appendChild(document.createTextNode('⚙'))
      componentButton.title = 'Replace with component.'
      componentButton.onclick = function () {
        update({
          action: 'replace with component',
          path: childPath
        })
      }
      section.appendChild(componentButton)
    }
    var deleteButton = document.createElement('button')
    deleteButton.appendChild(document.createTextNode('❌'))
    deleteButton.title = 'Delete.'
    deleteButton.onclick = function () {
      update({
        action: 'delete',
        path: childPath
      })
    }
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
      .sort(function (a, b) {
        return levelValue(b.level) - levelValue(a.level)
      })
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
    if (isComponent) {
      section.appendChild(renderComponent(child, childPath))
    } else {
      section.appendChild(renderContents(
        depth,
        childPath.concat('form'),
        form,
        childTree
      ))
    }
    fragment.appendChild(section)
    fragment.appendChild(renderDropZone(
      state.selected ? 'move' : 'child',
      path.concat('content', absoluteIndex + 1)
    ))
  })
  return fragment
}

function levelValue (level) {
  if (level === 'info') return 1
  if (level === 'warn') return 2
  if (level === 'error') return 3
  return 0
}

function renderDropZone (effect, path) {
  var button = document.createElement('button')
  if (effect === 'child') {
    button.onclick = function () {
      update({action: 'child', path: path})
    }
    button.className = 'child-button'
    button.appendChild(document.createTextNode('Add § here.'))
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

var rendered

computeState(function () {
  rendered = render()
  document.getElementById('editor').appendChild(rendered)
})
