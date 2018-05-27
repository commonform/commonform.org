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
var substitute = require('commonform-substitute')
var validate = require('commonform-validate')

// TODO: Show upgraded component resolutions.

var annotators = [
  {name: 'structural errors', annotator: require('commonform-lint')},
  {name: 'archaisms', annotator: require('commonform-archaic')},
  {name: 'wordiness', annotator: require('commonform-wordy')},
  {name: 'MSCD', annotator: require('commonform-mscd')}
]

var state = window.state = {
  form: window.form,
  publishers: window.publishers,
  selected: false,
  annotators: [annotators[0].annotator],
  expanded: [] // paths of components to expand
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
  article.appendChild(renderSaveForm())
  var summary = renderSummary()
  if (summary) article.appendChild(summary)
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

function renderSaveForm () {
  var form = document.createElement('form')

  var publisher = document.createElement('input')
  publisher.id = 'publisher'
  publisher.type = 'text'
  publisher.required = true
  form.appendChild(withLabel('Publisher', publisher))

  var password = document.createElement('input')
  password.id = 'password'
  password.type = 'password'
  password.required = true
  form.appendChild(withLabel('Password', password))

  var project = document.createElement('input')
  project.id = 'project'
  project.type = 'text'
  form.appendChild(withLabel('Project', project))

  var edition = document.createElement('input')
  edition.id = 'edition'
  edition.type = 'text'
  form.appendChild(withLabel('Edition', edition))

  var button = document.createElement('button')
  button.type = 'submit'
  button.appendChild(document.createTextNode('Save'))
  form.appendChild(button)

  form.onsubmit = function (event) {
    event.preventDefault()
    event.stopPropagation()
    var publisher = getValue('publisher')
    var password = getValue('password')
    var project = getValue('project')
    var edition = getValue('edition')
    if (publisher && password && project && edition) {
      saveForm(function () {
        var url = (
          'https://api.commonform.org' +
          '/publishers/' + encodeURIComponent(publisher) +
          '/projects/' + encodeURIComponent(project) +
          '/publications/' + encodeURIComponent(edition)
        )
        fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': authorization()
          },
          body: JSON.stringify({digest: state.tree.digest})
        })
          .then(function (response) {
            var status = response.status
            if (status === 204 || status === 201) {
              window.location = (
                '/' + encodeURIComponent(publisher) +
                '/' + encodeURIComponent(project) +
                '/' + encodeURIComponent(edition)
              )
            }
          })
      })
    } else if (publisher && password) {
      saveForm(function () {
        window.location = '/forms/' + state.tree.digest
      })
    }

    function saveForm (callback) {
      fetch('https://api.commonform.org/forms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authorization()
        },
        body: JSON.stringify(state.form)
      })
        .then(function (response) {
          var status = response.status
          if (status === 204 || status === 201) {
            callback()
          }
        })
    }

    function authorization () {
      return 'Basic ' + btoa(
        document.getElementById('publisher').value + ':' +
        document.getElementById('password').value
      )
    }

    function getValue (id) {
      return document.getElementById(id).value
    }
  }

  return form
}

function withLabel (prompt, input) {
  var label = document.createElement('label')
  label.appendChild(document.createTextNode(prompt))
  label.appendChild(input)
  return label
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

function renderSummary () {
  var termRE = /^The term "([^"]+)" is used, but not defined.$/
  var headingRE = /^The heading "([^"]+)" is referenced, but not used.$/
  var terms = []
  var headings = []
  state.annotations.forEach(function (annotation) {
    var match
    match = termRE.exec(annotation.message)
    if (match && !terms.includes(match[1])) terms.push(match[1])
    match = headingRE.exec(annotation.message)
    if (match && !headings.includes(match[1])) headings.push(match[1])
  })
  if (terms.length === 0 && headings.length === 0) return false

  var header = document.createElement('header')
  header.className = 'summary'
  if (terms.length !== 0) {
    var termsList = document.createElement('ul')
    termsList.className = 'undefined'
    terms.forEach(function (term) {
      var li = document.createElement('li')
      li.appendChild(document.createTextNode(term))
      termsList.appendChild(li)
    })
    header.appendChild(termsList)
  }
  if (headings.length !== 0) {
    var headingsList = document.createElement('ul')
    headingsList.className = 'brokenReferences'
    headings.forEach(function (heading) {
      var li = document.createElement('li')
      li.appendChild(document.createTextNode(heading))
      headingsList.appendChild(li)
    })
    header.appendChild(headingsList)
  }
  return header
}

function update (message) {
  var action = message.action
  if (action === 'select') {
    state.selected = message.path
  } else if (action === 'deselect') {
    state.selected = false
  } else if (action === 'delete') {
    state.changed = true
    let path = message.path
    let parent = parentOfPath(path)
    parent.content.splice(path[path.length - 1], 1)
    state.selected = false
  } else if (action === 'child') {
    state.changed = true
    let path = message.path
    let clone = JSON.parse(JSON.stringify(state.form))
    let parent = keyarrayGet(clone, path.slice(0, -2))
    let child = {form: {content: ['...']}}
    parent.content.splice(path[path.length - 1], 0, child)
    if (!validate.form(clone, {allowComponents: true})) return
    state.form = clone
    state.selected = path
  } else if (action === 'move') {
    state.changed = true
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
    state.changed = true
    let child = keyarrayGet(state.form, message.path)
    let heading = message.heading
    if (heading) child.heading = heading
    else delete child.heading
  } else if (action === 'content') {
    state.changed = true
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
    state.changed = true
    let path = message.path
    let child = keyarrayGet(state.form, path)
    if (child.conspicuous) delete child.conspicuous
    else child.conspicuous = 'yes'
  } else if (action === 'toggle update') {
    state.changed = true
    let path = message.path
    let component = keyarrayGet(state.form, path)
    if (component.upgrade) delete component.upgrade
    else component.upgrade = 'yes'
  } else if (action === 'substitute term') {
    state.changed = true
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
    state.changed = true
    let path = message.path
    let child = keyarrayGet(state.form, path)
    let component = message.component || {
      repository: 'api.commonform.org',
      publisher: 'kemitchell',
      project: 'placeholder-component',
      edition: '1e',
      substitutions: {terms: {}, headings: {}}
    }
    if (child.heading) component.heading = child.heading
    let parent = parentOfPath(path)
    parent.content.splice(path[path.length - 1], 1, component)
  } else if (action === 'expand component') {
    let path = message.path
    var already = state.expanded.some(function (element) {
      return samePath(element, path)
    })
    if (!already) state.expanded.push(path)
  } else if (action === 'collapse component') {
    let path = message.path
    let index = state.expanded.find(function (element) {
      return samePath(element, path)
    })
    if (index) state.expanded.splice(index, 1)
  }
  if (!message.doNotComputeState) {
    fixSubstitutions()
    computeState(renderAndMorph)
  } else {
    setImmediate(renderAndMorph)
  }
  function renderAndMorph () {
    window.requestAnimationFrame(function () {
      morph(rendered, render())
    })
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

function matchingLoadedComponent (component) {
  return state.components.find(function (pair) {
    var other = pair.component
    return (
      other.repository === component.repository &&
      other.publisher === component.publisher &&
      other.project === component.project &&
      other.edition === component.edition &&
      other.upgrade === component.upgrade
    )
  }).loaded
}

function renderComponent (component, path) {
  var loaded = matchingLoadedComponent(component)
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

  var publisherSelect = document.createElement('select')
  publisherSelect.className = 'publisherSelect'
  setOptions(publisherSelect, state.publishers, component.publisher)
  publisherSelect.onchange = function () {
    populateProjectSelect(this)
    disableEditionSelect(this)
  }
  p.appendChild(publisherSelect)

  function populateProjectSelect (context, initial) {
    var publisherSelect = onlySiblingWithClass(context, 'publisherSelect')
    var projectSelect = onlySiblingWithClass(context, 'projectSelect')
    fetchProjects(
      component.repository, publisherSelect.value,
      function (error, projects) {
        if (error) return
        setOptions(projectSelect, [''].concat(projects), initial)
      }
    )
  }

  function onlySiblingWithClass (sibling, className) {
    return sibling.parentNode.getElementsByClassName(className)[0]
  }

  function disableEditionSelect (context) {
    var editionSelect = onlySiblingWithClass(context, 'editionSelect')
    editionSelect.disabled = true
    editionSelect.innerHTML = ''
  }

  var projectSelect = document.createElement('select')
  projectSelect.className = 'projectSelect'
  setOptions(projectSelect, [component.project], component.project)
  projectSelect.onchange = function () {
    populateEditionSelect(this)
  }
  whenInserted(projectSelect, function () {
    populateProjectSelect(this, component.project)
  })
  p.appendChild(projectSelect)

  function populateEditionSelect (context, initial) {
    var publisherSelect = onlySiblingWithClass(context, 'publisherSelect')
    var projectSelect = onlySiblingWithClass(context, 'projectSelect')
    fetchEditions(
      component.repository, publisherSelect.value, projectSelect.value,
      function (error, editions) {
        if (error) return
        setOptions(editionSelect, [''].concat(editions), initial)
      }
    )
  }

  function whenInserted (node, handler) {
    node.addEventListener('DOMNodeInsertedIntoDocument', handler, {once: true})
  }

  var editionSelect = document.createElement('select')
  editionSelect.className = 'editionSelect'
  whenInserted(editionSelect, function () {
    populateEditionSelect(this, component.edition)
  })
  setOptions(editionSelect, [component.edition], component.edition)
  editionSelect.onchange = function () {
    var publisher = publisherSelect.value
    var project = projectSelect.value
    var edition = this.value
    if (
      component.publisher !== publisher ||
      component.project !== project ||
      component.edition !== edition
    ) {
      update({
        action: 'replace with component',
        path: path,
        component: {
          repository: component.repository,
          publisher: publisher,
          project: project,
          edition: edition,
          substitutions: {terms: {}, headings: {}}
        }
      })
    }
  }
  p.appendChild(editionSelect)

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

function setOptions (select, values, selected) {
  var fragment = document.createDocumentFragment()
  values.forEach(function (value) {
    var option = document.createElement('option')
    option.value = value
    option.appendChild(document.createTextNode(value))
    if (value === selected) option.selected = true
    fragment.appendChild(option)
  })
  select.innerHTML = ''
  select.disabled = false
  select.appendChild(fragment)
}

function renderContents (depth, path, form, tree, options) {
  var fixed = options && options.fixed
  var fragment = document.createDocumentFragment()
  var offset = 0
  var groups = group(form)
  var inSelected = isInSelected(path)
  if (groups[0].type === 'series' && !fixed) {
    fragment.appendChild(renderDropZone(
      (state.selected && !inSelected) ? 'move' : 'child',
      path.concat('content', 0)
    ))
  }
  groups.forEach(function (group) {
    if (group.type === 'series') {
      fragment.appendChild(
        renderSeries(depth + 1, offset, path, group, tree, options)
      )
    } else {
      fragment.appendChild(
        renderParagraph(offset, path, group, tree, options)
      )
      if (!fixed) {
        fragment.appendChild(renderDropZone(
          (state.selected && !inSelected) ? 'move' : 'child',
          path.concat('content', offset + group.content.length)
        ))
      }
    }
    offset += group.content.length
  })
  return fragment
}

function renderParagraph (offset, path, paragraph, tree, options) {
  var fixed = options && options.fixed
  var p = document.createElement('p')
  p.className = 'paragraph'
  var originalMarkup = paragraph.content
    .map(renderParagraphElement)
    .join('')
  p.appendChild(document.createTextNode(originalMarkup))
  if (!fixed) {
    p.contentEditable = true
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

function isInSelected (path) {
  var selected = state.selected
  return (
    selected &&
    selected.length < path.length &&
    samePath(path.slice(0, selected.length), selected)
  )
}

function renderSeries (depth, offset, path, series, tree, options) {
  var fixed = options && options.fixed
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
    var inSelected = isInSelected(childPath)
    var isComponent = child.hasOwnProperty('repository')
    var isExpanded = state.expanded.some(function (element) {
      return samePath(element, childPath)
    })
    section.className = classnames({
      component: isComponent,
      conspicuous: child.conspicuous,
      selected: selected,
      expanded: isExpanded
    })
    var selector = document.createElement('a')
    selector.className = classnames({
      selector: true,
      component: isComponent,
      child: !isComponent
    })
    if (!fixed) {
      selector.onclick = function () {
        if (selected) {
          update({action: 'deselect'})
        } else {
          update({
            action: 'select',
            path: childPath,
            doNotComputeState: true
          })
        }
      }
    }
    section.appendChild(selector)
    if (child.heading) {
      var heading = document.createElement('h1')
      heading.className = 'heading'
      heading.appendChild(document.createTextNode(child.heading || ''))
      if (!fixed) {
        heading.contentEditable = true
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
      }
      section.appendChild(heading)
    } else if (selected && !fixed) {
      var headingButton = document.createElement('button')
      headingButton.appendChild(document.createTextNode('⚐'))
      headingButton.onclick = function () {
        update({
          action: 'heading',
          path: childPath,
          heading: 'New Heading'
        })
      }
      section.appendChild(headingButton)
    }
    if (!isComponent && selected && !fixed) {
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
    if (selected && !fixed) {
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
      if (isComponent) {
        if (isExpanded) {
          var collapseButton = document.createElement('button')
          collapseButton.appendChild(document.createTextNode('⊖'))
          collapseButton.title = 'Collapse component.'
          collapseButton.onclick = function () {
            update({
              action: 'collapse component',
              path: childPath,
              doNotComputeState: true
            })
          }
          section.appendChild(collapseButton)
        } else {
          var expandButton = document.createElement('button')
          expandButton.appendChild(document.createTextNode('⊕'))
          expandButton.title = 'Expand component.'
          expandButton.onclick = function () {
            update({
              action: 'expand component',
              path: childPath,
              doNotComputeState: true
            })
          }
          section.appendChild(expandButton)
        }
      }
    }
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
      if (isExpanded) {
        var loaded = matchingLoadedComponent(child)
        var expanded = substitute(loaded, child.substitutions)
        section.appendChild(renderContents(
          depth,
          childPath.concat('form'),
          expanded,
          merkleize(expanded),
          {fixed: true}
        ))
      } else {
        section.appendChild(renderComponent(child, childPath))
      }
    } else {
      section.appendChild(renderContents(
        depth,
        childPath.concat('form'),
        form,
        childTree,
        options
      ))
    }
    fragment.appendChild(section)
    if (!fixed) {
      fragment.appendChild(renderDropZone(
        (state.selected && !inSelected) ? 'move' : 'child',
        path.concat('content', absoluteIndex + 1)
      ))
    }
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
  } else if (effect === 'move') {
    button.onclick = function (event) {
      update({action: 'move', path: path})
    }
    button.className = 'move-button'
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

function fetchProjects (repository, publisher, callback) {
  fetch(
    'https://' + repository +
    '/publishers/' + encodeURIComponent(publisher) +
    '/projects'
  )
    .then(function (response) { return response.json() })
    .then(function (projects) { callback(null, projects) })
    .catch(callback)
}

function fetchEditions (repository, publisher, project, callback) {
  fetch(
    'https://' + repository +
    '/publishers/' + encodeURIComponent(publisher) +
    '/projects/' + encodeURIComponent(project) +
    '/publications'
  )
    .then(function (response) { return response.json() })
    .then(function (editions) { callback(null, editions) })
    .catch(callback)
}

window.addEventListener('beforeunload', function (event) {
  if (state.changed) event.returnValue = 'If you leave this page without saving, your work will be lost.'
})
