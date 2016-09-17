var API = require('../api-server')
var annotate = require('../utilities/annotate')
var annotators = require('../annotators')
var assert = require('assert')
var cache = require('../cache')
var clone = require('../utilities/clone')
var deepEqual = require('deep-equal')
var diff = require('commonform-diff')
var docx = require('commonform-docx')
var ecb = require('ecb')
var filesaver = require('filesaver.js').saveAs
var find = require('array-find')
var fix = require('commonform-fix-strings')
var getComments = require('../queries/comments')
var getForm = require('../queries/form')
var getFormPublications = require('../queries/form-publications')
var getPublicationForm = require('../queries/publication-form')
var isSHA256 = require('is-sha-256-hex-digest')
var keyarray = require('keyarray')
var level = require('../level')
var markContentElements = require('../utilities/mark-content-elements')
var merkleize = require('commonform-merkleize')
var numberings = require('../numberings')
var querystring = require('querystring')
var removeEmptyForms = require('../utilities/remove-empty-forms')
var rename = require('commonform-rename')
var runParallel = require('run-parallel')
var signaturePagesToOOXML = require('ooxml-signature-pages')
var simplify = require('commonform-simplify-structure')
var xhr = require('xhr')

var slice = Array.prototype.slice
var splice = Array.prototype.splice

module.exports = function (initialize, reduction, handler) {
  initialize(function () {
    var annotatorFlags = {}
    annotators.forEach(function (annotator) {
      annotatorFlags[annotator.name] = annotator.default
    })
    return {
      annotators: annotatorFlags,
      numbering: numberings[0].name,
      annotations: null,
      comments: [],
      blanks: [],
      diff: null,
      error: null,
      focused: null,
      merkle: null,
      mode: 'read',
      path: [],
      projects: [],
      publications: [],
      parentComment: null,
      signaturePages: [],
      tree: null
    }
  })

  reduction('mode', function (mode) {
    return {mode: mode}
  })

  handler('mode', function (mode, state, reduce, done) {
    reduce('mode', mode)
    done()
  })

  reduction('blank', function (action, state) {
    var blank = action.path
    var value = action.value
    var index = state.blanks.findIndex(function (record) {
      return deepEqual(record.blank, blank)
    })
    var newBlanks = clone(state.blanks)
    if (value === null) {
      if (index > -1) {
        newBlanks.splice(index, 1)
        return {blanks: newBlanks}
      }
    } else {
      if (index < 0) {
        newBlanks.unshift({blank: blank})
        index = 0
      }
      newBlanks[index].value = value
      return {blanks: newBlanks}
    }
  })

  handler('blank', function (action, state, reduce, done) {
    reduce('blank', action)
    done()
  })

  reduction('comparing', function (action, state) {
    return {
      comparing: {
        tree: action.tree,
        merkle: merkleize(action.tree),
        publications: action.publications
      },
      diff: state.hasOwnProperty('tree')
      ? diff(state.tree, action.tree)
      : null
    }
  })

  handler('compare', function (digests, state, reduce, done) {
    var first = digests[0]
    var second = digests[1]
    if (state.merkle && state.merkle.digest === first) {
      fetchComparing()
    } else {
      loadForm(first, ecb(done, function (result) {
        reduce('tree', result)
        fetchComparing()
      }))
    }
    function fetchComparing () {
      loadForm(second, ecb(done, function (result) {
        reduce('comparing', result)
        reduce('mode', 'read')
        done()
      }))
    }
  })

  reduction('focus', function (path) {
    return {focused: path}
  })

  handler('focus', function (path, state, reduce, done) {
    reduce('focus', path)
    done()
  })

  reduction('signatures', function (action, state) {
    var pages = clone(state.signaturePages)
    var operand
    if (action.operation === 'push') {
      operand = action.key.length === 0
      ? pages
      : keyarray.get(pages, action.key)
      operand.push(action.value)
    } else if (action.operation === 'splice') {
      operand = keyarray.get(pages, action.key.slice(0, -1))
      operand.splice(action.key.slice(-1), 1)
    } else {
      keyarray[action.operation](pages, action.key, action.value)
    }
    return {signaturePages: pages}
  })

  handler('signatures', function (action, state, reduce, done) {
    reduce('signatures', action)
    done()
  })

  reduction('tree', function (action, state) {
    return {
      mode: action.mode || state.mode,
      dynamic: action.dynamic || false,
      error: null,
      tree: action.tree,
      path: [],
      projects: [],
      blanks: [],
      annotations: annotate(state.annotators, action.tree),
      comments: action.comments || null,
      merkle: action.merkle || merkleize(action.tree),
      publications: action.publications || [],
      signaturePages: [],
      focused: null,
      parentComment: null,
      diff: state.hasOwnProperty('comparing')
      ? diff(action.tree, state.comparing.tree)
      : null
    }
  })

  function pushEditedTree (data, reduce, callback) {
    removeEmptyForms(data.tree)
    var merkle = data.merkle = merkleize(data.tree)
    var root = merkle.digest
    var path = formPath(root)
    var json = JSON.stringify(data.tree)
    cache.put(root, json, ecb(callback, function () {
      window.history.pushState(data, '', path)
      reduce('tree', data)
      callback()
    }))
  }

  handler('child', function (action, state, reduce, done) {
    assert(Array.isArray(action.path))
    var path = action.path
    var newChild = {form: {content: ['...']}}
    var newTree = clone(state.tree)
    var array = keyarray.get(newTree, path.slice(0, -1))
    var index = path[path.length - 1]
    array.splice(index, 0, newChild)
    pushEditedTree({tree: newTree}, reduce, done)
  })

  handler('splice', function (action, state, reduce, done) {
    assert(Array.isArray(action.path))
    var newTree = clone(state.tree)
    var path = action.path
    var array = keyarray.get(newTree, path.slice(0, -1))
    var index = path[path.length - 1]
    array.splice(index, 1)
    fix(newTree)
    pushEditedTree({tree: newTree}, reduce, done)
  })

  handler('move', function (action, state, reduce, done) {
    assert(Array.isArray(action.path))
    assert(Array.isArray(state.focused))
    var fromPath = state.focused
    var toPath = action.path
    // Do not move forms within themselves.
    if (deepEqual(fromPath, toPath.slice(0, fromPath.length))) {
      done()
    } else {
      var newTree = clone(state.tree)
      var hasMoving = keyarray.get(newTree, fromPath.slice(0, -1))
      var moving = keyarray.get(newTree, fromPath)
      var hasTarget = keyarray.get(newTree, toPath.slice(0, -1))
      var fromIndex = fromPath[fromPath.length - 1]
      var toIndex = toPath[toPath.length - 1]
      hasTarget.splice(toIndex, 0, moving)
      var oldIndex = toIndex > fromIndex
      ? hasMoving.indexOf(moving)
      : hasMoving.lastIndexOf(moving)
      hasMoving.splice(oldIndex, 1)
      pushEditedTree({tree: newTree}, reduce, done)
    }
  })

  handler('heading', function (action, state, reduce, done) {
    var path = action.path
    var newHeading = action.heading
    var newTree = clone(state.tree)
    if (newHeading.length === 0) {
      keyarray.delete(newTree, path.concat('heading'))
    } else {
      keyarray.set(newTree, path.concat('heading'), newHeading)
    }
    pushEditedTree({tree: newTree}, reduce, done)
  })

  handler('conspicuous', function (action, state, reduce, done) {
    var path = action.path
    var conspicuous = action.conspicuous
    var newTree = clone(state.tree)
    var suffix = ['form', 'conspicuous']
    if (conspicuous === true) {
      keyarray.set(newTree, path.concat(suffix), 'yes')
    } else {
      keyarray.delete(newTree, path.concat(suffix))
    }
    pushEditedTree({tree: newTree}, reduce, done)
  })

  handler('edit', function (action, state, reduce, done) {
    assert(action.element)
    assert(Array.isArray(action.context))
    assert(Number.isInteger(action.offset))
    assert(Number.isInteger(action.count))
    var element = action.element
    var children = slice.call(element.childNodes)
    var elements = children.map(function (element) {
      var nodeType = element.nodeType
      var tagName = element.tagName
      var className = element.className
      // Handle nodes our renderer generates for valid form content.
      // span.string
      if (tagName === 'SPAN' && className === 'string') {
        return element.textContent
      // dfn
      } else if (tagName === 'DFN') {
        return {definition: element.textContent}
      // a.use
      } else if (tagName === 'A' && className === 'use') {
        return {use: element.textContent}
      // a.reference
      } else if (tagName === 'A' && className === 'reference') {
        return {reference: element.textContent}
      // input.blank
      } else if (tagName === 'INPUT' && className === 'blank') {
        return {blank: ''}
      // Handle nodes our rendered does _not_ generate.  These come
      // from user input and copy-and-paste.
      } else if (nodeType === window.Node.TEXT_NODE) {
        return element.textContent
      } else if (nodeType === window.Node.ELEMENT_NODE) {
        return element.textContent
      // Return an empty string for anything else.
      // commonform-fix-strings will make sure we end up with valid
      // form content.
      } else {
        return ''
      }
    })
    elements = markContentElements(state.tree, elements)
    var newTree = clone(state.tree)
    var context = keyarray.get(newTree, action.context)
    var offset = action.offset
    var count = action.count
    splice.apply(context, [offset, count].concat(elements))
    fix(keyarray.get(newTree, action.context.slice(0, -1)))
    pushEditedTree({tree: newTree}, reduce, done)
  })

  handler('fetch', function (data, state, reduce, done) {
    var digest = data.digest
    loadForm(digest, ecb(done, function (result) {
      reduce(data.comparing ? 'comparing' : 'tree', result)
      done()
    }))
  })

  handler('load form', function (digest, state, reduce, done) {
    loadForm(digest, ecb(done, function (data) {
      data.mode = 'read'
      reduce('tree', data)
      window.history.pushState(data, '', formPath(digest))
      done()
    }))
  })

  handler('new form', function (action, state, reduce, done) {
    var tree = {content: ['Click to edit.']}
    reduce('tree', {tree: tree})
    reduce('mode', 'edit')
    var path = formPath(state.merkle.digest)
    window.history.pushState(tree, '', path)
    done()
  })

  handler('load publication', function (data, state, reduce, done) {
    getPublicationForm(data, ecb(done, function (tree, digest) {
      data.mode = 'read'
      getFormPublications(digest, function (error, publications) {
        reduce('tree', {
          tree: tree,
          publications: error ? [] : publications
        })
        window.history.pushState(tree, '', formPath(digest))
        done()
      })
    }))
  })

  handler('loaded', function (tree, state, reduce, done) {
    var merkle = merkleize(tree)
    var root = merkle.digest
    var data = {
      mode: 'read',
      tree: tree,
      merkle: merkle
    }
    reduce('tree', data)
    reduce('mode', 'read')
    window.history.pushState(data, '', formPath(root))
    done()
  })

  reduction('numbering', function (data, state) {
    assert(numberings.some(function (numbering) {
      return numbering.name === data.name
    }))
    return {
      numbering: data.name
    }
  })

  handler('numbering', function (name, state, reduce, done) {
    assert(numberings.some(function (numbering) {
      return numbering.name === name
    }))
    var json = JSON.stringify(name)
    level.put('settings.numbering', json, ecb(done, function () {
      reduce('numbering', {name: name})
      done()
    }))
  })

  reduction('annotators', function (data, state) {
    return {
      annotators: data,
      annotations: state.tree
      ? annotate(state.annotators, state.tree)
      : []
    }
  })

  handler('toggle annotator', function (data, state, reduce, done) {
    var annotators = state.annotators
    annotators[data.annotator] = data.enabled
    var json = JSON.stringify(annotators)
    level.put('settings.annotators', json, ecb(done, function () {
      reduce('annotators', state.annotators)
      done()
    }))
  })

  handler('save', function (data, state, reduce, done) {
    var publisher = data.publisher
    var password = data.password
    var digest = state.merkle.digest
    save(state, publisher, password, ecb(done, function () {
      window.alert('Saved form ' + digest)
      reduce('mode', 'read')
      done()
    }))
  })

  handler('publish', function (data, state, reduce, done) {
    var publisher = data.publisher
    var password = data.password
    var project = data.project
    var edition = data.edition
    var digest = state.merkle.digest
    save(state, publisher, password, ecb(done, function () {
      publish(
        digest, publisher, password, project, edition,
        ecb(done, function () {
          window.alert(
            'Published ' + publisher + '\'s ' +
            project + ' ' + edition + '.'
          )
          reduce('mode', 'read')
          done()
        })
      )
    }))
  })

  reduction('comments', function (comments, state) {
    return {comments: comments}
  })

  function fetchComments (data, state, reduce, done) {
    var digest = state.merkle.digest
    getComments(digest, ecb(done, function (comments) {
      reduce('comments', comments)
      done()
    }))
  }

  reduction('reply to', function (parent, state) {
    return {parentComment: parent}
  })

  handler('reply to', function (uuid, state, reduce, done) {
    reduce('reply to', uuid)
    done()
  })

  handler('comment', function (data, state, reduce, done) {
    var publisher = data.publisher
    var password = data.password
    if (data.context === 'root') {
      data.context = state.merkle.digest
    }
    delete data.password
    xhr({
      method: 'POST',
      uri: API + '/annotations',
      withCredentials: true,
      headers: {
        'X-Requested-With': 'XMLHttpRequest',
        'Content-Type': 'application/json'
      },
      username: publisher,
      password: password,
      body: JSON.stringify(data)
    }, ecb(done, function (response, body) {
      var status = response.statusCode
      if (status === 200 || status === 204) {
        fetchComments(data, state, reduce, done)
      } else {
        done(new Error(body))
      }
    }))
  })

  handler('subscribe', function (data, state, reduce, done) {
    var publisher = data.publisher
    var password = data.password
    var digest = state.merkle.digest
    xhr({
      method: 'POST',
      uri: API + '/forms/' + digest + '/subscribers/' + publisher,
      withCredentials: true,
      headers: {
        'X-Requested-With': 'XMLHttpRequest',
        'Content-Type': 'application/json'
      },
      username: publisher,
      password: password
    }, ecb(done, function (response, body) {
      var status = response.statusCode
      if (status === 200 || status === 204 || status === 409) {
        window.alert('Subscribed!')
      } else {
        done(new Error(body))
      }
    }))
  })

  handler('email', function (data, state, reduce, done) {
    window.location.href = 'mailto:?' + querystring.stringify({
      subject: 'Link to Common Form',
      body: 'https://commonform.org/forms/' + state.merkle.digest
    })
  })

  handler('download docx', function (data, state, reduce, done) {
    var title = window.prompt('Enter a document title', 'Untitled Form')
    if (title !== null) {
      var numberingName = state.numbering
      var options = {
        title: title,
        numbering: find(numberings, function (numbering) {
          return numbering.name === numberingName
        })
        .numbering
      }
      if (state.signaturePages) {
        options.after = signaturePagesToOOXML(state.signaturePages)
      }
      filesaver(
        docx(clone(state.tree), state.blanks, options)
        .generate({type: 'blob'}),
        fileName(title, 'docx'),
        true
      )
    }
  })

  handler('download project', function (data, state, reduce, done) {
    var title = window.prompt('Enter a file name', 'Untitled Form')
    if (title !== null) {
      var blob = new window.Blob(
        [
          JSON.stringify({
            blanks: state.blanks,
            signaturePages: state.signaturePages,
            tree: state.tree
          })
        ],
        {type: 'application/json;charset=utf-8'}
      )
      filesaver(blob, fileName(title, 'cform'), true)
    }
  })

  handler('rename term', function (data, state, reduce, done) {
    var newTree = clone(state.tree)
    var target = window.prompt('Heading to replace:')
    if (target === null || target === '') {
      return
    }
    var replacement = window.prompt('Replacement heading:')
    if (replacement === null || replacement === '') {
      return
    }
    rename.term(target, replacement, newTree)
    pushEditedTree({tree: newTree}, reduce, done)
  })

  handler('rename heading', function (data, state, reduce, done) {
    var newTree = clone(state.tree)
    var target = window.prompt('Term to replace:')
    if (target === null || target === '') {
      return
    }
    var replacement = window.prompt('Replacement term:')
    if (replacement === null || replacement === '') {
      return
    }
    rename.heading(target, replacement, newTree)
    pushEditedTree({tree: newTree}, reduce, done)
  })

  handler('simplify', function (data, state, reduce, done) {
    var newTree = clone(state.tree)
    simplify(newTree)
    pushEditedTree({tree: newTree}, reduce, done)
  })

  handler('identify', function (data, state, reduce, done) {
    var newTree = clone(state.tree)
    identify(newTree, newTree)
    pushEditedTree({tree: newTree}, reduce, done)
  })

  handler('replace', function (data, state, reduce, done) {
    var path = data.path
    var prompt = data.digest
    ? 'Enter a form digest:'
    : 'Enter a publication like "goldplate\'s enforcement 1e":'
    var replacement = window.prompt(prompt)
    if (!replacement) {
      return
    }
    replacement = replacement
    .trim()
    .toLowerCase()
    if (isSHA256(replacement)) {
      getForm(replacement, function (error, tree) {
        if (error) {
          window.alert('Could not find form.')
        } else {
          replaceWith(tree)
        }
      })
    } else {
      var PROJECT_NAME_GROUP = '([a-z0-9-]+)'
      var match = new RegExp(
        '^' +
        '([a-z]+)' + // [1] publisher
        '\'s? ' +
        '(' + // [2]
        PROJECT_NAME_GROUP + // [3] project
        '|' +
        '(' + // [4]
        '(current|latest)' + ' ' + // [5] edition
        PROJECT_NAME_GROUP + // [6] project
        ')' +
        '|' +
        '(' + // [7]
        PROJECT_NAME_GROUP + ' ' +// [8] project
        '([0-9eucd]+)' + // [9] edition
        ')' +
        ')' +
        '$'
      )
      .exec(replacement)
      if (!match) {
        window.alert('Bad digest or publication')
      } else {
        var query = {
          publisher: match[1],
          edition: 'current'
        }
        if (match[3]) {
          query.project = match[3]
        } else if (match[4]) {
          query.edition = match[5]
          query.project = match[6]
        } else if (match[7]) {
          query.project = match[8]
          query.edition = match[9]
        }
        getPublicationForm(query, function (error, tree, digest) {
          if (error) {
            window.alert('Could not find "' + replacement + '"')
          } else {
            replaceWith(tree)
          }
        })
      }
    }

    function replaceWith (tree) {
      var newTree = clone(state.tree)
      keyarray.set(newTree, path.concat('form'), tree)
      pushEditedTree({tree: newTree}, reduce, done)
    }
  })
}

function identify (wholeTree, subTree) {
  subTree.content = markContentElements(wholeTree, subTree.content)
  subTree.content.forEach(function (element) {
    if (element.hasOwnProperty('form')) {
      identify(wholeTree, element.form)
    }
  })
}

function save (state, publisher, password, callback) {
  xhr({
    method: 'POST',
    uri: API + '/forms',
    withCredentials: true,
    headers: {
      'X-Requested-With': 'XMLHttpRequest',
      'Content-Type': 'application/json'
    },
    username: publisher,
    password: password,
    body: JSON.stringify(state.tree)
  }, ecb(callback, function (response, body) {
    var status = response.statusCode
    if (status === 200 || status === 204) {
      callback()
    } else {
      callback(new Error(body))
    }
  }))
}

function publish (
  digest, publisher, password, project, edition, callback
) {
  xhr({
    method: 'POST',
    uri: (
      API +
      '/publishers/' + encodeURIComponent(publisher) +
      '/projects/' + encodeURIComponent(project) +
      '/publications/' + encodeURIComponent(edition)
    ),
    withCredentials: true,
    headers: {
      'X-Requested-With': 'XMLHttpRequest',
      'Content-Type': 'application/json'
    },
    username: publisher,
    password: password,
    body: JSON.stringify({digest: digest})
  }, ecb(callback, function (response, body) {
    var status = response.statusCode
    if (status === 200 || status === 204) {
      callback()
    } else {
      callback(new Error(body))
    }
  }))
}

function formPath (digest) {
  return '/forms/' + digest
}

function loadForm (digest, callback) {
  runParallel(
    [
      function (done) {
        getForm(digest, ecb(done, function (tree) {
          done(null, tree)
        }))
      },
      function (done) {
        getFormPublications(
          digest,
          function (error, publications) {
            if (error) {
              done(null, [])
            } else {
              done(null, publications)
            }
          }
        )
      },
      function (done) {
        getComments(digest, function (error, comments) {
          if (error) {
            done(null, null)
          } else {
            done(null, comments)
          }
        })
      }
    ],
    ecb(callback, function (results) {
      callback(null, {
        tree: results[0],
        publications: results[1],
        comments: results[2]
      })
    })
  )
}

function fileName (title, extension) {
  var date = new Date().toISOString()
  return '' + title + ' ' + date + '.' + extension
}
