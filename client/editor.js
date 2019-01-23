/* eslint-env browser */
var analyze = require('commonform-analyze')
var capitalize = require('capitalize')
var classnames = require('classnames')
var fixStrings = require('commonform-fix-strings')
var formRepositoryPath = require('../paths/repository/form')
var formSubscriberRepositoryPath = require('../paths/repository/form-subscriber')
var group = require('commonform-group-series')
var keyarrayGet = require('keyarray-get')
var loadComponents = require('commonform-load-components')
var merkleize = require('commonform-merkleize')
var morph = require('nanomorph')
var parse = require('commonform-markup-parse')
var predicate = require('commonform-predicate')
var projectFrontEndPath = require('../paths/front-end/project')
var publicationFrontEndPath = require('../paths/front-end/publication')
var publicationRepositoryPath = require('../paths/repository/publication')
var publisherFrontEndPath = require('../paths/front-end/publisher')
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

if (window.publication.signaturePages) {
  normalizeSignaturePages(window.publication.signaturePages)
}

var state = window.state = {
  repository: window.repository,
  domain: window.domain,
  form: window.form,
  publishers: window.publishers,
  selected: false,
  annotators: [annotators[0].annotator],
  expanded: [], // paths of components to expand
  signaturePages: window.publication.signaturePages || []
}

function normalizeSignaturePages (pages) {
  var terms = Object.keys(analyze(window.form).definitions)
  pages.forEach(function (page) {
    if (Array.isArray(page.information)) {
      var asObject = {}
      page.information.forEach(function (key) {
        asObject[key] = null
      })
      page.information = asObject
    }
    if (!page.hasOwnProperty('entities')) page.entities = []
    if (!page.hasOwnProperty('information')) page.information = {}
    if (page.term && terms.indexOf(page.term) === -1) delete page.term
  })
}

function conformedSignaturePages () {
  return state.signaturePages
    .map(function (normalizedPage) {
      var standardPage = {}
      if (normalizedPage.entities.length !== 0) {
        standardPage.entities = normalizedPage.entities
          .map(function (entity) {
            var standardEntity = {}
            ;['name', 'form', 'jurisdiction', 'by']
              .forEach(function (key) {
                if (entity[key]) {
                  standardEntity[key] = entity[key]
                }
              })
            return standardEntity
          })
      }
      if (normalizedPage.header) {
        standardPage.header = normalizedPage.header
      }
      if (normalizedPage.samePage) {
        standardPage.samePage = true
      }
      standardPage.information = []
      Object.keys(normalizedPage.information)
        .forEach(function (key) {
          if (normalizedPage.information[key] !== undefined) {
            standardPage.information.push(key)
          }
        })
      return standardPage
    })
}

function clearSelected () {
  state.selected = false
}

// TODO: Show error if term in signature page isn't defined.
function computeState (done) {
  var form = state.form
  fixStrings(form)
  state.tree = merkleize(form)
  var formAnalysis = analyze(form)
  // Load each component in the form.
  runParallel(
    formAnalysis.components.map(function (entry) {
      var component = entry[0]
      return function (done) {
        fetch(
          'https://' + state.repository +
          publicationRepositoryPath(
            component.publisher,
            component.project,
            component.edition
          )
        )
          .then(function (response) {
            return response.json()
          })
          .then(function (publication) {
            return fetch(
              'https://' + state.repository +
              formRepositoryPath(publication.digest)
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
      if (error) {
        state.components = false
        return done()
      }
      state.components = components
      var clone = JSON.parse(JSON.stringify(form))
      loadComponents(clone, {}, function (error, loaded) {
        if (error) return done()
        state.loaded = loaded
        state.annotations = state.annotators
          .reduce(function (annotations, annotator) {
            return annotations.concat(annotator(loaded))
          }, [])
        state.analysis = analyze(loaded)
        done()
      })
    }
  )
}

function render () {
  var article = document.createElement('article')
  article.appendChild(renderOpenMenu())
  article.appendChild(renderOptions())
  article.appendChild(renderSaveForm())
  var summary = renderSummary()
  if (summary) article.appendChild(summary)
  article.appendChild(renderAnnotationCounts())
  var section = document.createElement('section')
  section.className = 'commonform'
  section.appendChild(renderContents(0, [], state.form, state.tree))
  article.appendChild(section)
  article.appendChild(renderSignaturePages())
  return article
}

function renderOpenMenu () {
  var form = document.createElement('form')
  form.className = 'openFileForm'
  form.onsubmit = function (event) {
    event.preventDefault()
    var file = document.getElementById('file').files[0]
    var reader = new window.FileReader()
    reader.onload = function (event) {
      var result = event.target.result
      var json
      try {
        json = JSON.parse(result)
      } catch (error) {
        window.alert(error.message)
      }
      if (json.hasOwnProperty('content')) {
        update({action: 'load form', form: json})
      } else if (json.hasOwnProperty('form')) {
        update({action: 'load form', form: json.form})
      } else if (json.hasOwnProperty('tree')) {
        update({action: 'load form', form: json.tree})
      } else {
        window.alert('Not a Common Form project file.')
      }
    }
    reader.readAsText(file, 'UTF-8')
    document.getElementById('file').value = null
  }

  var fileInput = document.createElement('input')
  fileInput.type = 'file'
  fileInput.name = 'file'
  fileInput.id = 'file'
  fileInput.required = true
  fileInput.accept = '.cform,.commonform,.json'
  form.appendChild(fileInput)

  var button = document.createElement('button')
  button.appendChild(document.createTextNode('Load File'))
  button.type = 'submit'
  form.appendChild(button)

  return form
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
  form.id = 'saveForm'

  var credentials = document.createElement('p')
  form.appendChild(credentials)

  var publisher = document.createElement('input')
  publisher.id = 'publisher'
  publisher.type = 'text'
  publisher.required = true
  publisher.autocomplete = 'username'
  publisher.placeholder = 'Publisher Name'
  publisher.value = window.publication.publisher || ''
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
  project.placeholder = (
    (window.publication.project || 'Project Name') +
    ' (optional)'
  )
  publication.appendChild(project)

  var edition = document.createElement('input')
  edition.id = 'edition'
  edition.type = 'text'
  edition.placeholder = 'Edition (optional)'
  publication.appendChild(edition)

  var title = document.createElement('input')
  title.id = 'title'
  title.type = 'text'
  title.placeholder = 'Document Title (optional)'
  title.value = window.publication.title || ''
  form.appendChild(title)

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
    var title = getValue('title')
    if (publisher && password && project && edition) {
      saveForm(function (error, digest) {
        if (error) return window.alert(error.message)
        var url = (
          'https://' + state.repository +
          publicationRepositoryPath(publisher, project, edition)
        )
        var body = {digest: state.tree.digest}
        if (notes) body.notes = notes.split(/(\r?\n){2}/)
        if (title) body.title = title.trim()
        if (state.signaturePages.length !== 0) {
          body.signaturePages = conformedSignaturePages()
        }
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
              if (!subscribe) return redirect()
              subscribeToForm(digest, function (error) {
                if (error) window.alert(error.message)
                redirect()
              })
            }
            function redirect () {
              window.location = publicationFrontEndPath(
                publisher, project, edition
              )
            }
          })
      })
    } else if (publisher && password) {
      if (state.signaturePages.length !== 0) {
        var response = window.confirm(
          'Save the form without signature pages?\n' +
          '(Signature pages can only be saved with published forms.)'
        )
        if (!response) return
      }
      saveForm(function (error, digest) {
        if (error) return window.alert(error.message)
        state.changed = false
        if (!subscribe) return redirect()
        subscribeToForm(digest, function (error) {
          if (error) window.alert(error.message)
          redirect()
        })
        function redirect () {
          window.location = '/forms/' + state.tree.digest
        }
      })
    }

    function saveForm (callback) {
      fetch('https://' + state.repository + '/forms', {
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
            if (!subscribe) callback(new Error('Error saving form.'))
            else {
              var digest = response.headers.get('Location')
                .replace('/forms/', '')
              callback(null, digest)
            }
          } else {
            if (status === 409) {
              callback(new Error('Already published with that project name and edition.'))
            } else {
              callback(new Error('Server Error'))
            }
          }
        })
    }

    function subscribeToForm (digest, callback) {
      var url = (
        'https://' + state.repository +
        formSubscriberRepositoryPath(digest, publisher)
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

function renderSignaturePages () {
  var pages = state.signaturePages

  var section = document.createElement('section')
  section.className = 'signaturePages'

  pages.forEach(function (page, pageIndex) {
    section.appendChild(renderSignaturePage(page, pageIndex))
  })

  var button = document.createElement('button')
  button.onclick = function (event) {
    event.preventDefault()
    event.stopPropagation()
    update({action: 'add signature page'})
  }
  button.appendChild(document.createTextNode('Add Signature Page'))
  section.appendChild(button)

  return section
}

function renderSignaturePage (page, pageIndex) {
  var entities = page.entities || []
  var information = page.information || []

  var div = document.createElement('div')
  div.className = classnames('page', {samePage: page.samePage})

  var samePageToggle = document.createElement('input')
  samePageToggle.type = 'checkbox'
  samePageToggle.onclick = function () {
    update({action: 'toggle same page', pageIndex})
  }
  if (page.samePage) samePageToggle.checked = true
  var samePageLabel = document.createElement('label')
  samePageLabel.appendChild(samePageToggle)
  samePageLabel.appendChild(document.createTextNode('Same Page'))
  div.appendChild(samePageLabel)

  var headerInput = document.createElement('input')
  headerInput.className = 'header'
  headerInput.type = 'text'
  headerInput.value = page.header || ''
  headerInput.placeholder = 'Signature Page Header'
  headerInput.onchange = function () {
    update({
      action: 'set signature page header',
      pageIndex,
      header: this.value
    })
  }
  div.appendChild(headerInput)

  var terms = Object.keys(state.analysis.definitions)
  if (terms.length !== 0) {
    var definedTermP = document.createElement('p')
    var termLabel = document.createElement('label')
    termLabel.appendChild(document.createTextNode('Defined Term for Party'))
    var select = document.createElement('select')
    select.onchange = function () {
      update({
        action: 'set signature page term',
        term: this.value,
        pageIndex
      })
    }
    var blank = document.createElement('option')
    select.appendChild(blank)
    terms.forEach(function (term) {
      var option = document.createElement('option')
      option.value = term
      option.appendChild(document.createTextNode(term))
      if (page.term === term) option.selected = true
      select.appendChild(option)
    })
    termLabel.appendChild(select)
    definedTermP.appendChild(termLabel)
    div.appendChild(definedTermP)
  }

  if (entities.length !== 0) {
    entities.forEach(function (entity, entityIndex) {
      div.appendChild(renderEntity(entity, pageIndex, entityIndex))
    })
  }

  var addEntity = document.createElement('button')
  addEntity.appendChild(document.createTextNode('Add Prefilled Entity'))
  addEntity.onclick = function () {
    update({
      action: 'add signature page entity',
      pageIndex
    })
  }
  div.appendChild(addEntity)

  var byP = document.createElement('p')
  var byLabel = document.createElement('label')
  byLabel.appendChild(document.createTextNode('By'))
  var byInput = document.createElement('input')
  byInput.type = 'text'
  byInput.placeholder = '/s/ Jane Doe'
  byInput.onchange = function () {
    update({
      action: 'set conformed signature',
      pageIndex,
      value: this.value
    })
  }
  byInput.value = page.conformed || ''
  byLabel.appendChild(byInput)
  byP.appendChild(byLabel)
  div.appendChild(byP)

  var nameP = document.createElement('p')
  var nameLabel = document.createElement('label')
  nameLabel.appendChild(document.createTextNode('Name'))
  var nameInput = document.createElement('input')
  nameInput.type = 'text'
  nameInput.onchange = function () {
    update({
      action: 'set signature page name',
      pageIndex,
      value: this.value
    })
  }
  nameInput.placeholder = 'Jane Doe'
  nameInput.value = page.name || ''
  nameLabel.appendChild(nameInput)
  nameP.appendChild(nameLabel)
  div.appendChild(nameP)

  var optional = ['date', 'email', 'address']
  optional.forEach(function (key) {
    var p = document.createElement('p')
    var display = key === 'email' ? 'E-Mail' : capitalize(key)
    var label = document.createElement('label')
    var checkbox = document.createElement('input')
    checkbox.type = 'checkbox'
    checkbox.onchange = function () {
      var action = this.checked
        ? 'require signature page information'
        : 'do not require signature page information'
      update({action, key, pageIndex})
    }
    label.appendChild(checkbox)
    label.appendChild(document.createTextNode('Require ' + display))
    p.appendChild(label)
    if (information.hasOwnProperty(key)) {
      checkbox.checked = true
      var input = document.createElement('input')
      input.type = 'text'
      input.placeholder = 'Prefill ' + display
      input.value = information[key] || ''
      input.onchange = function () {
        update({
          action: 'prefill signature page information',
          pageIndex,
          key,
          value: this.value
        })
      }
      p.appendChild(input)
    }
    div.appendChild(p)
  })

  var deleteButton = document.createElement('button')
  deleteButton.appendChild(document.createTextNode('Delete Signature Page'))
  deleteButton.onclick = function () {
    update({
      action: 'delete signature page',
      pageIndex
    })
  }
  div.appendChild(deleteButton)

  return div
}

function renderEntity (entity, pageIndex, entityIndex) {
  var p = document.createElement('p')
  p.appendChild(labeledInput('name', 'Name', 'SomeCo, Inc.'))
  p.appendChild(labeledInput('form', 'Legal Form', 'corporation'))
  p.appendChild(labeledInput('jurisdiction', 'Jurisdiction', 'Delaware'))
  p.appendChild(labeledInput('by', 'Signing', 'Chief Executive Officer'))
  var button = document.createElement('button')
  button.appendChild(document.createTextNode('Delete Prefilled Entity'))
  button.onclick = function () {
    update({
      action: 'delete signature page entity',
      pageIndex,
      entityIndex
    })
  }
  p.appendChild(button)
  return p

  function labeledInput (key, text, placeholder) {
    var p = document.createElement('p')
    var label = document.createElement('label')
    var input = document.createElement('input')
    input.type = 'text'
    input.value = entity[key] || ''
    input.placeholder = placeholder
    input.onchange = function () {
      update({
        action: 'prefill signature page entity',
        key,
        pageIndex,
        entityIndex,
        value: this.value
      })
    }
    label.appendChild(document.createTextNode(text))
    label.appendChild(input)
    p.appendChild(label)
    return p
  }
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
    let spliceArguments = [offset, length].concat(parsed)
    contentArray.splice.apply(contentArray, spliceArguments)
    if (!validate.form(clone, {allowComponents: true})) return
    state.form = clone
  } else if (action === 'delete content') {
    state.changed = true
    let path = message.path
    let offset = message.offset
    let length = message.length
    let clone = JSON.parse(JSON.stringify(state.form))
    let contentArray = keyarrayGet(clone, path).content
    let spliceArguments = [offset, length]
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
      repository: state.repository,
      publisher: 'kemitchell',
      project: 'placeholder-component',
      edition: '1e',
      substitutions: {terms: {}, headings: {}}
    }
    if (child.heading) component.heading = child.heading
    let parent = parentOfPath(path)
    parent.content.splice(path[path.length - 1], 1, component)
  } else if (action === 'replace with form') {
    state.changed = true
    let path = message.path
    let currentChild = keyarrayGet(state.form, path)
    let form = message.form
    let newChild = {form}
    if (currentChild.heading) newChild.heading = currentChild.heading
    let parent = parentOfPath(path)
    parent.content.splice(path[path.length - 1], 1, newChild)
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
  } else if (action === 'load form') {
    state.changed = true
    state.form = message.form
    state.expanded = []
    clearSelected()
  } else if (action === 'add signature page') {
    state.changed = true
    state.signaturePages.push({
      entities: [],
      information: {}
    })
  } else if (action === 'delete signature page') {
    state.changed = true
    let pageIndex = message.pageIndex
    state.signaturePages.splice(pageIndex, 1)
  } else if (action === 'toggle same page') {
    state.changed = true
    let pageIndex = message.pageIndex
    let signaturePages = state.signaturePages
    let page = signaturePages[pageIndex]
    if (page.samePage) delete page.samePage
    else page.samePage = true
  } else if (action === 'require signature page information') {
    state.changed = true
    let pageIndex = message.pageIndex
    let key = message.key
    let page = state.signaturePages[pageIndex]
    let information = page.information
    if (!information.hasOwnProperty(key)) {
      information[key] = null
    }
  } else if (action === 'do not require signature page information') {
    state.changed = true
    let pageIndex = message.pageIndex
    let key = message.key
    let page = state.signaturePages[pageIndex]
    let information = page.information
    delete information[key]
  } else if (action === 'add signature page entity') {
    state.changed = true
    let pageIndex = message.pageIndex
    let page = state.signaturePages[pageIndex]
    page.entities.push({
      name: null,
      form: null,
      jurisdiction: null,
      by: null
    })
  } else if (action === 'delete signature page entity') {
    state.changed = true
    let pageIndex = message.pageIndex
    let entityIndex = message.entityIndex
    let page = state.signaturePages[pageIndex]
    page.entities.splice(entityIndex, 1)
  } else if (action === 'prefill signature page entity') {
    state.changed = true
    let pageIndex = message.pageIndex
    let entityIndex = message.entityIndex
    let page = state.signaturePages[pageIndex]
    let entity = page.entities[entityIndex]
    let key = message.key
    let value = message.value
    if (value) entity[key] = value
    else delete entity[key]
  } else if (action === 'set signature page term') {
    state.changed = true
    let pageIndex = message.pageIndex
    let page = state.signaturePages[pageIndex]
    let term = message.term
    if (message.term) page.term = term
    else delete page.term
  } else if (action === 'set signature page header') {
    state.changed = true
    let pageIndex = message.pageIndex
    let page = state.signaturePages[pageIndex]
    let header = message.header
    if (header) page.header = message.header
    else delete page.header
  } else if (action === 'set conformed signature') {
    state.changed = true
    let pageIndex = message.pageIndex
    let page = state.signaturePages[pageIndex]
    let value = message.value
    if (value) page.conformed = value
    else delete page.conformed
  } else if (action === 'set signature page name') {
    state.changed = true
    let pageIndex = message.pageIndex
    let page = state.signaturePages[pageIndex]
    let value = message.value
    if (value) page.name = value
    else delete page.name
  } else if (action === 'prefill signature page information') {
    state.changed = true
    let pageIndex = message.pageIndex
    let page = state.signaturePages[pageIndex]
    let value = message.value
    let key = message.key
    if (value) page.information[key] = value
    else delete page.information[key]
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
  var analysis = state.analysis
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
  publisherLink.href = publisherFrontEndPath(component.publisher)
  publisherLink.target = '_blank'
  publisherLink.appendChild(document.createTextNode(component.publisher))
  p.appendChild(publisherLink)

  p.appendChild(document.createTextNode('/'))

  var projectLink = document.createElement('a')
  projectLink.href = projectFrontEndPath(component)
  projectLink.target = '_blank'
  projectLink.appendChild(document.createTextNode(component.project))
  p.appendChild(projectLink)

  p.appendChild(document.createTextNode('/'))

  var editionLink = document.createElement('a')
  editionLink.href = publicationFrontEndPath(component)
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
        update({
          action: 'delete content',
          path: path,
          offset: offset,
          length: paragraph.content.length
        })
      } else if (newMarkup !== originalMarkup) {
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
      conspicuous: form && form.conspicuous,
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
          'Enter the URL of a publication or form.',
          isComponent
            ? (
              'https://' + state.repository +
              publicationRepositoryPath(child.publisher, child.project, child.edition)
            )
            : ''
        )
        if (input === null) return
        var componentRE = new RegExp(
          '^' +
          'https:\\/\\/' +
          state.domain +
          '\\/([^/]+)\\/([^/]+)\\/(.+)' +
          '$'
        )
        var componentMatch = componentRE.exec(input)
        if (componentMatch) {
          var publisher = componentMatch[1]
          var project = componentMatch[2]
          var edition = componentMatch[3]
          return fetchPublication(
            state.repository, publisher, project, edition,
            function (error) {
              if (error) return alert('Could not find that publication.')
              update({
                action: 'replace with component',
                path: childPath,
                component: {
                  repository: state.repository,
                  publisher,
                  project,
                  edition,
                  substitutions: {terms: {}, headings: {}}
                }
              })
            }
          )
        }
        var formRE = new RegExp(
          '^' +
          'https:\\/\\/' +
          state.domain +
          '\\/forms\\/([a-f0-9]{64})' +
          '$'
        )
        var formMatch = formRE.exec(input)
        if (!formMatch) return alert('Invalid URL')
        var digest = formMatch[1]
        return fetchForm(state.repository, digest, function (error, form) {
          if (error) return alert('Could not find that form.')
          update({
            action: 'replace with form',
            path: childPath,
            form: form
          })
        })
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
    'https://' + state.repository +
    publicationRepositoryPath(publisher, project, edition)
  )
    .then(function (response) { return response.json() })
    .then(function (editions) { callback(null, editions) })
    .catch(callback)
}

function fetchForm (repository, digest, callback) {
  fetch('https://' + state.repository + formRepositoryPath(digest))
    .then(function (response) { return response.json() })
    .then(function (form) { callback(null, form) })
    .catch(callback)
}

window.addEventListener('beforeunload', function (event) {
  if (state.changed) event.returnValue = 'If you leave this page without saving, your work will be lost.'
})
