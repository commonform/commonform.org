var API = require('../api-server')
var annotate = require('../utilities/annotate')
var annotators = require('../annotators')
var assert = require('assert')
var btoa = window.btoa
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
var treeify = require('commonform-treeify-annotations')
var xhr = require('xhr')

module.exports = function (initialize, _reduction, handler) {
  // A Note on the Special `rerender` Model Property
  //
  // By default, the editor view rerenders the entire form
  // tree every time. Especially for large forms, that's
  // a pretty deep tree, with lots and lots of elements.
  // JavaScript rendering can consume >200ms on reasonable
  // desktop machines. Reconciliation sometimes takes twice
  // that. Runtime GC pauses in the middle of long rendering
  // cycles are very common, making it even worse.
  //
  // The code uses two mechanisms to mitigate those
  // performance issues:
  //
  // 1.  The renderer sets `.isSameNode` on `<section>` and
  //     `<p class=text>` elements.  `nanomorph` uses those
  //     methods to short-circuit reconciliation, skipping
  //     the branch if `isSameNode(target)` returns `true`.
  //     The methods set check `data-digest` properties on
  //     elements to see if the form content is the same.
  //
  //     This is the "official" optimization method
  //     mentioned in `nanomorph`'s documentation.
  //
  // 2.  The form model sets a `rerender` property on each
  //     reduction indicating which parts of the tree need
  //     to be rerendered in the next pass.
  //
  //     When `rerender` is `true`, the entire tree needs
  //     to be rerendered.
  //
  //     When `rerender` is `false`, none of the form tree
  //     needs to be rerendered.  This is the case for
  //     changes to signature page data, for example.
  //
  //     Otherwise, `rerender` is an array of keyarrays
  //     corresponding to tree locations---forms, content
  //     elements, &c.---that need to be rerendered, along
  //     with all of their parents.
  //
  //     The form view checks this property.  If a form
  //     doesn't need rerendering, the view returns a
  //     placeholder element with `isSameNode` set.  When
  //     `nanomorph` walks to the node, it skips that part
  //     of the tree, leaving the existing elements alone.
  //
  // The `rerender` approach allows us to avoid rendering
  // and reconciling code with more model code.
  // Order-of-magnitude performance gains are common,
  // especially for common, relatively self-contained
  // interactions, like focusing a child form.
  //
  // At the same time, the approach erodes the neatness and
  // safety of the functional-reactive rendering approach.
  // The UI _can_ end up inconsistent with the application's
  // state if `rerender` doesn't list each and every form
  // that needs updating. This isn't as simple as noting
  // which forms' _content_ has changed. If a change in one
  // part of the tree leads to an annotation in another
  // part, both children---and all their parents---need to
  // be rerendered.

  // Wrap the usual reduction setup function to ensure the
  // `rerender` property is always set to `true` (rerender
  // the whole form tree) by default.
  function reduction (event, handler) {
    _reduction(event, function (action, state) {
      var result = handler(action, state)
      if (!result.hasOwnProperty('rerender')) {
        result.rerender = true
      }
      return result
    })
  }

  initialize(function () {
    var annotatorFlags = {}
    annotators.forEach(function (annotator) {
      annotatorFlags[annotator.name] = annotator.default
    })
    return {
      rerender: true,
      annotators: annotatorFlags,
      annotations: null,
      annotationsList: [],
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
      renaming: false,
      saving: false,
      signaturePages: [],
      tree: null
    }
  })

  function simpleReduction (key) {
    reduction(key, function (value) {
      var returned = {}
      returned[key] = value
      return returned
    })
  }

  simpleReduction('mode')
  simpleReduction('error')

  function simpleHandler (key) {
    handler(key, function (data, state, reduce, done) {
      reduce(key, data)
      done()
    })
  }

  simpleHandler('mode')

  reduction('blank', function (action, state) {
    var blank = action.path
    var value = action.value
    var index = state.blanks.findIndex(function (record) {
      return deepEqual(record.blank, blank)
    })
    var newBlanks = clone(state.blanks)
    if (value === null) {
      if (index > -1) {
        var spliced = newBlanks.splice(index, 1)[0]
        return {
          blanks: newBlanks,
          rerender: [spliced.blank.slice(0, -3)]
        }
      }
    } else {
      if (index < 0) {
        newBlanks.unshift({blank: blank})
        index = 0
      }
      newBlanks[index].value = value
      return {
        blanks: newBlanks,
        rerender: [blank.slice(0, -3)]
      }
    }
  })

  simpleHandler('blank')

  reduction('comparing', function (action, state) {
    return {
      mode: 'read',
      comparing: {
        tree: action.tree,
        merkle: merkleize(action.tree),
        publications: action.publications
      },
      diff: state.hasOwnProperty('tree')
        ? diff(state.tree, action.tree)
        : null,
      rerender: true
    }
  })

  handler('compare', function (digests, state, reduce, done) {
    var first = digests[0]
    var second = digests[1]
    if (state.merkle && state.merkle.digest === first) {
      requestComparing()
    } else {
      requestForm(first, function (error, result) {
        if (error) {
          reduce('error', error)
          done()
        } else {
          reduce('tree', result)
          requestComparing()
        }
      })
    }
    function requestComparing () {
      requestForm(second, function (error, result) {
        if (error) {
          reduce('error', error)
          done()
        } else {
          reduce('comparing', result)
          done()
        }
      })
    }
  })

  reduction('focus', function (newlyFocused, state) {
    var previouslyFocused = state.focused
    var rerender = []
    // If there was already a focused form, rerender it
    // without focus.
    if (previouslyFocused) {
      rerender.push(previouslyFocused)
    }
    // If there is a newly focused form, rerender it
    // with focus.
    if (newlyFocused) {
      rerender.push(newlyFocused)
    }
    return {
      focused: newlyFocused,
      rerender: rerender
    }
  })

  simpleHandler('focus')

  reduction('signatures', function (action, state) {
    var pages = clone(state.signaturePages)
    var operand
    var operation = action.operation
    if (operation === 'push') {
      operand = action.key.length === 0
        ? pages
        : keyarray.get(pages, action.key)
      operand.push(action.value)
    } else if (operation === 'splice') {
      operand = keyarray.get(pages, action.key.slice(0, -1))
      operand.splice(action.key.slice(-1), 1)
    } else if (operation === 'push') {
      operand = keyarray.get(pages, action.key)
      operand.push(action.value)
    } else if (operation === 'toggle') {
      var lastKey = action.key[action.key.length - 1]
      operand = keyarray.get(pages, action.key.slice(0, -1))
      operand[lastKey] = !operand[lastKey]
    } else {
      keyarray[action.operation](pages, action.key, action.value)
    }
    return {
      signaturePages: pages,
      rerender: false
    }
  })

  simpleHandler('signatures')

  // TODO: Compute `rerender` array.
  reduction('tree', function (action, state) {
    var annotationsList = annotate(state.annotators, action.tree)
    return {
      mode: action.mode || state.mode,
      error: null,
      tree: action.tree,
      path: [],
      projects: [],
      // TODO: Preserve blanks that couldn't have been affected by
      // changes to the three.
      blanks: [],
      annotations: treeify(annotationsList),
      annotationsList: annotationsList,
      comments: action.comments || null,
      merkle: action.merkle || merkleize(action.tree),
      publications: action.publications || [],
      signaturePages: action.signaturePages || [],
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
    var children = Array.prototype.slice.call(element.childNodes)
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
      // .blank
      } else if (className === 'blank') {
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
    Array.prototype.splice.apply(context, [offset, count]
      .concat(elements))
    fix(keyarray.get(newTree, action.context.slice(0, -1)))
    pushEditedTree({tree: newTree}, reduce, done)
  })

  handler('fetch', function (data, state, reduce, done) {
    var digest = data.digest
    requestForm(digest, function (error, result) {
      if (error) {
        reduce('error', error)
        done()
      } else {
        reduce(data.comparing ? 'comparing' : 'tree', result)
        done()
      }
    })
  })

  handler('load form', function (digest, state, reduce, done) {
    requestForm(digest, function (error, data) {
      if (error) {
        reduce('error', error)
        done()
      } else {
        data.mode = 'read'
        reduce('tree', data)
        window.history.pushState(data, '', formPath(digest))
        done()
      }
    })
  })

  handler('new form', function (action, state, reduce, done) {
    var tree = {content: ['Click to edit.']}
    reduce('tree', {tree: tree, mode: 'read'})
    var path = formPath(state.merkle.digest)
    window.history.pushState(tree, '', path)
    done()
  })

  handler('load publication', function (data, state, reduce, done) {
    getPublicationForm(data, function (error, tree, digest, signaturePages) {
      if (error) {
        reduce('error', error)
        done()
      } else {
        data.mode = 'read'
        // TODO: Revisit error handling.
        getFormPublications(digest, function (error, publications) {
          reduce('tree', {
            tree: tree,
            publications: error ? [] : publications,
            signaturePages: signaturePages
              ? signaturePages.map(function (page) {
                if (page.entities === undefined) {
                  page.entities = []
                }
                if (page.information === undefined) {
                  page.information = []
                }
                return page
              })
              : []
          })
          window.history.replaceState(tree, '', formPath(digest))
          done()
        })
      }
    })
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
    window.history.pushState(data, '', formPath(root))
    done()
  })

  reduction('numbering', function (data, state) {
    assert(numberings.some(function (numbering) {
      return numbering.name === data.name
    }))
    return {
      numbering: data.name,
      rerender: false
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
    var oldAnnotationsList = state.annotationsList || []
    var newAnnotationsList = state.tree
      ? annotate(state.annotators, state.tree)
      : []
    var changed = annotationChanges(
      newAnnotationsList, oldAnnotationsList
    )
    return {
      annotators: data,
      annotations: treeify(newAnnotationsList),
      annotationsList: newAnnotationsList,
      rerender: changed
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

  reduction('prependHash', function (data, state) {
    return {
      prependHash: data,
      rerender: false
    }
  })

  handler('prependHash', function (data, state, reduce, done) {
    var json = JSON.stringify(data)
    level.put('settings.prependHash', json, ecb(done, function () {
      reduce('prependHash', data)
      done()
    }))
  })

  reduction('markFilled', function (data, state) {
    return {
      markFilled: data,
      rerender: false
    }
  })

  handler('markFilled', function (data, state, reduce, done) {
    var json = JSON.stringify(data)
    level.put('settings.markFilled', json, ecb(done, function () {
      reduce('markFilled', data)
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
    var signaturePages = clone(state.signaturePages)
    signaturePages.forEach(function (page) {
      if (page.entities && page.entities.length === 0) {
        delete page.entities
      }
      if (page.information && page.information.length === 0) {
        delete page.information
      }
    })
    save(state, publisher, password, ecb(done, function () {
      publish(
        digest, signaturePages, publisher, password, project, edition,
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

  // TODO: Compute `rerender` array.
  reduction('comments', function (comments, state) {
    return {comments: comments}
  })

  function requestComments (data, state, reduce, done) {
    var digest = state.merkle.digest
    getComments(digest, function (error, comments) {
      if (error) {
        reduce('error', error)
        done()
      } else {
        reduce('comments', comments)
        done()
      }
    })
  }

  // TODO: Compute `rerender` array.
  reduction('reply to', function (parent, state) {
    return {parentComment: parent}
  })

  simpleHandler('reply to')

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
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + btoa(publisher + ':' + password)
      },
      body: JSON.stringify(data)
    }, ecb(done, function (response, body) {
      var status = response.statusCode
      if (status === 200 || status === 204) {
        requestComments(data, state, reduce, done)
      } else {
        reduce('error', new Error(body))
        done()
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
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + btoa(publisher + ':' + password)
      }
    }, ecb(done, function (response, body) {
      var status = response.statusCode
      if (status === 200 || status === 204 || status === 409) {
        window.alert('Subscribed!')
      } else {
        reduce('error', new Error(body))
        done()
      }
    }))
  })

  handler('email', function (data, state, reduce, done) {
    window.location.href = 'mailto:?' + querystring.stringify({
      subject: 'Link to Common Form',
      body: 'https://commonform.org/forms/' + state.merkle.digest
    })
  })

  ;['project', 'docx'].forEach(function (type) {
    handler('prepare ' + type, function (data, state, reduce, done) {
      reduce('mode', 'preparing ' + type)
      done()
    })
  })

  handler('read', function (data, state, reduce, done) {
    reduce('mode', 'read')
    done()
  })

  handler('download docx', function (data, state, reduce, done) {
    var title = data.title
    var numberingName = data.numbering
    var options = {
      title: title,
      numbering: find(numberings, function (numbering) {
        return numbering.name === numberingName
      })
        .numbering
    }
    options.hash = data.hash
    options.markFilled = data.markFilled
    if (state.signaturePages) {
      options.after = signaturePagesToOOXML(state.signaturePages)
    }
    filesaver(
      docx(clone(state.tree), state.blanks, options)
        .generate({type: 'blob'}),
      fileName(title, 'docx'),
      true
    )
    reduce('mode', 'read')
    done()
  })

  handler('download project', function (data, state, reduce, done) {
    var title = data.title
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
    reduce('mode', 'read')
    done()
  })

  ;['term', 'heading'].forEach(function (type) {
    handler('rename ' + type, function (data, state, reduce, done) {
      reduce('mode', 'renaming' + type)
      done()
    })
  })

  handler('replace term', function (data, state, reduce, done) {
    var newTree = clone(state.tree)
    var target = data.target
    if (target === null || target === '') {
      return
    }
    var replacement = data.replacement
    if (replacement === null || replacement === '') {
      return
    }
    rename.term(target, replacement, newTree)
    pushEditedTree({tree: newTree}, reduce, done)
  })

  handler('replace heading', function (data, state, reduce, done) {
    var newTree = clone(state.tree)
    var target = data.target
    if (target === null || target === '') {
      return
    }
    var replacement = data.replacement
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
    // TODO: reimplement form replacement w/o window.prompt
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
      'Content-Type': 'application/json',
      'Authorization': 'Basic ' + btoa(publisher + ':' + password)
    },
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
  digest, signaturePages, publisher, password, project, edition, callback
) {
  var body = {digest: digest}
  if (signaturePages.length !== 0) {
    body.signaturePages = signaturePages
  }
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
      'Content-Type': 'application/json',
      'Authorization': 'Basic ' + btoa(publisher + ':' + password)
    },
    body: JSON.stringify(body)
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

function requestForm (digest, callback) {
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

// Compute the set-difference between the set of paths
// annotated by `newAnnotations` and `oldAnnotations`.
function annotationChanges (newAnnotations, oldAnnotations) {
  var changed = []
  // Use set-arrays of JSON-encoded keyarrays so we can use
  // `list.indexOf` to test set membership.
  var newPaths = annotationJSONPaths(newAnnotations)
  var oldPaths = annotationJSONPaths(oldAnnotations)
  // Iterate both path lists at once, adding any that don't
  // appear in both lists to the returned differences array.
  var maxLength = Math.max(newPaths.length, oldPaths.length)
  for (var index = 0; index < maxLength; index++) {
    var newPath = newPaths[index]
    if (newPath) {
      if (oldPaths.indexOf(newPath) === -1) {
        changed.push(newPath)
      }
    }
    var oldPath = oldPaths[index]
    if (oldPath) {
      if (newPaths.indexOf(oldPath) === -1) {
        changed.push(oldPath)
      }
    }
  }
  return changed.map(JSON.parse)
}

// Return a set-array of all the paths covered by
// annotations in the list, encoded as JSON strings.
function annotationJSONPaths (annotations) {
  var paths = []
  for (var index = 0; index < annotations.length; index++) {
    var annotation = annotations[index]
    var json = JSON.stringify(annotation.path)
    if (paths.indexOf(json) === -1) {
      paths.push(json)
    }
  }
  return paths
}
