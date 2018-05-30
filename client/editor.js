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

var WHITE_FLAG_CHARACTER = '⚐'
var COMPONENT_CHARACTER = '⚙'
var WARNING_CHARACTER = '⚠'
var CROSS_CHARACTER = '❌'
var CIRCLE_MINUS = '⊖'
var CIRCLE_PLUS = '⊕'

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

function clearSelected () {
  state.selected = false
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
  article.appendChild(renderOptions())
  article.appendChild(renderSaveForm())
  var summary = renderSummary()
  if (summary) article.appendChild(summary)
  article.appendChild(renderAnnotationCounts())
  var section = document.createElement('section')
  section.className = 'commonform'
  section.appendChild(renderContents(0, [], state.form, state.tree))
  article.appendChild(section)
  return article
}

function renderOptions () {
  var form = document.createElement('form')
  form.className = 'annotationOptions'
  var p = document.createElement('p')
  p.appendChild(document.createTextNode('Check For:'))
  form.appendChild(p)
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
  return form
}

function renderSaveForm () {
  var form = document.createElement('form')
  form.className = 'saveForm'

  var credentials = document.createElement('p')
  form.appendChild(credentials)

  var publisher = document.createElement('input')
  publisher.id = 'publisher'
  publisher.type = 'text'
  publisher.required = true
  publisher.autocomplete = 'username'
  publisher.placeholder = 'Publisher Name'
  credentials.appendChild(publisher)

  var password = document.createElement('input')
  password.id = 'password'
  password.type = 'password'
  password.required = true
  password.autocomplete = 'current-password'
  password.placeholder = 'Password'
  credentials.appendChild(password)

  var publication = document.createElement('p')
  form.appendChild(publication)

  var project = document.createElement('input')
  project.id = 'project'
  project.type = 'text'
  project.placeholder = 'Project Name (optional)'
  publication.appendChild(project)

  var edition = document.createElement('input')
  edition.id = 'edition'
  edition.type = 'text'
  edition.placeholder = 'Edition (optional)'
  publication.appendChild(edition)

  var notes = document.createElement('textarea')
  notes.placeholder = 'Release Notes (optional)'
  notes.id = 'notes'
  form.appendChild(notes)

  var subscribeLabel = document.createElement('label')
  form.appendChild(subscribeLabel)

  var subscribe = document.createElement('input')
  subscribe.id = 'subscribe'
  subscribe.value = 'yes'
  subscribe.type = 'checkbox'
  subscribeLabel.appendChild(subscribe)
  subscribeLabel.appendChild(document.createTextNode('E-Mail Notifications'))

  var buttonParagraph = document.createElement('p')
  form.appendChild(buttonParagraph)

  var button = document.createElement('button')
  button.type = 'submit'
  button.appendChild(document.createTextNode('Save'))
  buttonParagraph.appendChild(button)

  form.onsubmit = function (event) {
    event.preventDefault()
    event.stopPropagation()
    var publisher = getValue('publisher')
    var password = getValue('password')
    var project = getValue('project')
    var edition = getValue('edition')
    var subscribe = getValue('subscribe') === 'yes'
    var notes = getValue('notes')
    if (publisher && password && project && edition) {
      saveForm(subscribe, function () {
        var url = (
          'https://api.commonform.org' +
          '/publishers/' + encodeURIComponent(publisher) +
          '/projects/' + encodeURIComponent(project) +
          '/publications/' + encodeURIComponent(edition)
        )
        var body = {digest: state.tree.digest}
        if (notes.value) body.notes = notes.value
        fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': authorization()
          },
          body: JSON.stringify(body)
        })
          .then(function (response) {
            var status = response.status
            if (status === 204 || status === 201) {
              state.changed = false
              window.location = (
                '/' + encodeURIComponent(publisher) +
                '/' + encodeURIComponent(project) +
                '/' + encodeURIComponent(edition)
              )
            }
          })
      })
    } else if (publisher && password) {
      saveForm(subscribe, function () {
        state.changed = false
        window.location = '/forms/' + state.tree.digest
      })
    }

    function saveForm (subscribe, callback) {
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
            if (!subscribe) callback()
            else {
              var digest = response.headers.get('Location')
                .replace('/forms/', '')
              var url = (
                'https://api.commonform.org' +
                '/forms/' + digest +
                '/subscribers/' + publisher
              )
              fetch(url, {
                method: 'POST',
                headers: {
                  'Authorization': authorization()
                }
              })
                .then(function (response) {
                  var status = response.status
                  if (status === 204 || status === 201) {
                    callback()
                  } else {
                    alert('Could not subscribe to notifications.')
                    callback()
                  }
                })
            }
          } else {
            if (status === 409) {
              alert('Already published with that project name and edition.')
            } else {
              alert('Server Error')
            }
          }
        })
    }

    function getPublisher () {
      return document.getElementById('publisher').value
    }

    function authorization () {
      return 'Basic ' + btoa(
        getPublisher() + ':' +
        document.getElementById('password').value
      )
    }

    function getValue (id) {
      return document.getElementById(id).value
    }
  }

  return form
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
    clearSelected()
  } else if (action === 'delete') {
    state.changed = true
    let path = message.path
    let parent = parentOfPath(path)
    parent.content.splice(path[path.length - 1], 1)
    clearSelected()
  } else if (action === 'child') {
    state.changed = true
    let path = message.path
    let clone = JSON.parse(JSON.stringify(state.form))
    let parent = keyarrayGet(clone, path.slice(0, -2))
    let child = {form: {content: ['...']}}
    parent.content.splice(path[path.length - 1], 0, child)
    if (!validate.form(clone, {allowComponents: true})) return
    state.form = clone
    clearSelected()
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
    if (child.form.conspicuous) delete child.form.conspicuous
    else child.form.conspicuous = 'yes'
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
  } else if (action === 'substitute heading') {
    state.changed = true
    let path = message.path
    let component = keyarrayGet(state.form, path)
    let original = message.original
    let substituted = message.substituted
    if (substituted.length === 0) {
      delete component.substitutions.headings[original]
    } else {
      component.substitutions.headings[original] = substituted
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
  p.className = 'identification'

  var publisherLink = document.createElement('a')
  publisherLink.href = (
    '/' + encodeURIComponent(component.publisher)
  )
  publisherLink.target = '_blank'
  publisherLink.appendChild(document.createTextNode(component.publisher))
  p.appendChild(publisherLink)

  p.appendChild(document.createTextNode('/'))

  var projectLink = document.createElement('a')
  projectLink.href = (
    '/' + encodeURIComponent(component.publisher) +
    '/' + encodeURIComponent(component.project)
  )
  projectLink.target = '_blank'
  projectLink.appendChild(document.createTextNode(component.project))
  p.appendChild(projectLink)

  p.appendChild(document.createTextNode('/'))

  var editionLink = document.createElement('a')
  editionLink.href = (
    '/' + encodeURIComponent(component.publisher) +
    '/' + encodeURIComponent(component.project) +
    '/' + encodeURIComponent(component.edition)
  )
  editionLink.target = '_blank'
  editionLink.appendChild(document.createTextNode(component.edition))
  p.appendChild(editionLink)

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
  upgradeLabel.appendChild(document.createTextNode('Upgrade'))
  if (component.upgrade) upgradeInput.checked = true
  p.appendChild(upgradeLabel)

  fragment.appendChild(p)

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
    headingsToResolve
      .sort()
      .forEach(function (original) {
        var substituted = component.substitutions.headings[original]
        var li = document.createElement('li')
        li.appendChild(document.createTextNode(original + ': '))
        var select = document.createElement('select')
        select.onchange = function () {
          update({
            action: 'substitute heading',
            path: path,
            original: original,
            substituted: this.value
          })
        }
        Object.keys(state.analysis.headings).forEach(function (heading) {
          var option = document.createElement('option')
          option.value = heading
          option.appendChild(document.createTextNode(heading))
          if (heading === substituted) option.selected = true
          select.appendChild(option)
        })
        var nullOption = document.createElement('option')
        nullOption.value = ''
        nullOption.appendChild(document.createTextNode('(Leave undefined.)'))
        if (substituted === undefined) nullOption.selected = true
        select.appendChild(nullOption)
        li.appendChild(select)
        headings.appendChild(li)
      })
    fragment.appendChild(headings)
  }

  return fragment
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
    p.spellcheck = true
    p.onkeypress = function (event) {
      if (event.which === 13 || event.keyCode === 13) this.blur()
    }
    p.onblur = function () {
      var newMarkup = this.textContent.replace(/[^\x20-\x7E]|\t/g, '')
      if (newMarkup.trim().length === 0) {
        this.textContent = originalMarkup
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
      conspicuous: child.form.conspicuous,
      selected: selected,
      expanded: isExpanded
    })
    var selector = document.createElement('button')
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
        heading.spellcheck = true
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
      headingButton.appendChild(document.createTextNode(WHITE_FLAG_CHARACTER))
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
      conspicuousButton.appendChild(document.createTextNode(WARNING_CHARACTER))
      conspicuousButton.title = 'Toggle conspicuous formatting.'
      conspicuousButton.onclick = function () {
        update({
          action: 'toggle conspicuous',
          path: childPath,
          doNotComputeState: true
        })
      }
      section.appendChild(conspicuousButton)
    }

    if (selected && !fixed) {
      var componentButton = document.createElement('button')
      componentButton.appendChild(document.createTextNode(COMPONENT_CHARACTER))
      componentButton.title = 'Replace with component.'
      componentButton.onclick = function () {
        var input = window.prompt(
          'Enter a new publication ID.',
          isComponent
            ? (child.publisher + '/' + child.project + '/' + child.edition)
            : 'kemitchell/placeholder-component/1e'
        )
        if (input === null) return
        var match = /^([^/]+)\/([^/]+)\/(.+)$/.exec(input)
        if (!match) return alert('Invalid publication ID.')
        var publisher = match[1]
        var project = match[2]
        var edition = match[3]
        fetchPublication(
          'api.commonform.org', publisher, project, edition,
          function (error) {
            if (error) return alert('Could not find that publication.')
            update({
              action: 'replace with component',
              path: childPath,
              component: {
                repository: 'api.commonform.org',
                publisher,
                project,
                edition,
                substitutions: {terms: {}, headings: {}}
              }
            })
          }
        )
      }
      section.appendChild(componentButton)
    }
    if (selected && !fixed) {
      var deleteButton = document.createElement('button')
      deleteButton.appendChild(document.createTextNode(CROSS_CHARACTER))
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
          collapseButton.appendChild(document.createTextNode(CIRCLE_MINUS))
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
          expandButton.appendChild(document.createTextNode(CIRCLE_PLUS))
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
      annotations.forEach(function (annotation) {
        var aside = document.createElement('aside')
        aside.className = 'annotation ' + annotation.level
        aside.appendChild(document.createTextNode(annotation.message))
        section.appendChild(aside)
      })
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
      this.blur()
    }
    button.className = 'child-button'
  } else if (effect === 'move') {
    button.onclick = function (event) {
      update({action: 'move', path: path})
      this.blur()
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

function fetchPublication (repository, publisher, project, edition, callback) {
  fetch(
    'https://' + repository +
    '/publishers/' + encodeURIComponent(publisher) +
    '/projects/' + encodeURIComponent(project) +
    '/publications/' + encodeURIComponent(edition)
  )
    .then(function (response) { return response.json() })
    .then(function (editions) { callback(null, editions) })
    .catch(callback)
}

window.addEventListener('beforeunload', function (event) {
  if (state.changed) event.returnValue = 'If you leave this page without saving, your work will be lost.'
})
