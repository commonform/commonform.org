var assert = require('assert')
var classnames = require('classnames')
var deepEqual = require('deep-equal')
var definition = require('./definition')
var details = require('./details')
var dropZone = require('./drop-zone')
var find = require('array-find')
var get = require('keyarray').get
var groupSeries = require('commonform-group-series')
var h = require('hyperscript')
var improvePunctuation = require('../utilities/improve-punctuation')
var input = require('./input')
var predicates = require('commonform-predicate')
var publisherLink = require('./publisher-link')
var reference = require('./reference')
var replaceUnicode = require('../utilities/replace-unicode')
var use = require('./use')

module.exports = form

function form (form, send) {
  assert(typeof form.tree === 'object')
  var root = form.path.length === 0
  var formKey = root ? [] : ['form']
  var tree = root ? form.tree : form.tree.form
  var groups = groupSeries(tree)
  var isFocused = form.focused && deepEqual(form.focused, form.path)
  var containsFocused = form.focused && (
    isFocused ||
    deepEqual(form.focused, form.path.slice(0, form.focused.length - 1))
  )
  var annotationsHere = get(
    form.annotations,
    formKey.concat('annotations'),
    []
  )
  var commentsHere = false
  if (form.comments) {
    for (var c = 0; c < form.comments.length; c++) {
      var comment = form.comments[c]
      if (comment.form === form.merkle.digest) {
        commentsHere = true
        break
      }
    }
  }
  var showComments = (
    (root || isFocused || form.withinFocused) &&
    commentsHere &&
    commentsHere.length !== 0
  )

  var digest = form.merkle.digest

  var section = document.createElement('section')
  section.className = classnames({
    conspicuous: 'conspicuous' in tree,
    focused: isFocused
  })
  // Encode some facts about the state that produced the
  // element in its `dataset`, so we can refer to compare
  // them after the next render in `isSameNode`.
  section.dataset.digest = digest
  section.dataset.comments = String(commentsHere)
  section.dataset.containsFocused = String(containsFocused)
  section.isSameNode = function (target) {
    return (
      // Section element.
      target && target.nodeName && target.nodeName === 'SECTION' &&
      target.dataset.digest === digest &&
      // No comments.
      commentsHere === false &&
      target.dataset.comments === 'false' &&
      // Does not contain focused form.
      containsFocused === false &&
      target.dataset.containsFocused === 'false'
    )
  }

  if (!root) {
    section.appendChild(sectionButton(toggleFocus))
  }

  if (isFocused) {
    section.appendChild(editControls(form, send))
  }

  if (!root && (form.tree.heading || isFocused || form.withinFocused)) {
    section.appendChild(
      heading(form.tree.heading, function (newValue) {
        send('form:heading', {
          path: form.path,
          heading: newValue
        })
      })
    )
  }

  if (isFocused) {
    section.appendChild(
      details(digest, annotationsHere, send)
    )
  }

  var margin = marginalia(
    tree, form.path, form.blanks,
    annotationsHere,
    (commentsHere && commentsHere.length !== 0),
    toggleFocus
  )

  if (margin) {
    section.appendChild(margin)
  }

  if (groups[0].type === 'series') {
    section.appendChild(
      dropZone(
        form.focused
          ? ((isFocused || form.withinFocused) ? 'none' : 'move')
          : 'child',
        form.path.concat(formKey, 'content', 0),
        send
      )
    )
  }

  var offset = 0
  for (var i = 0; i < groups.length; i++) {
    var group = groups[i]
    var groupState = {
      mode: form.mode,
      comments: form.comments,
      blanks: form.blanks,
      data: group,
      annotations: get(form.annotations, formKey, {}),
      focused: form.focused,
      withinFocused: isFocused || form.withinFocused,
      parentComment: form.parentComment,
      parentDigest: digest,
      offset: offset,
      path: form.path.concat(formKey)
    }
    var renderer
    if (group.type === 'series') {
      renderer = series
      groupState.merkle = form.merkle
    } else {
      renderer = paragraph
    }
    var result = renderer(groupState, send)
    if (renderer === series) {
      for (var n = 0; n < result.length; n++) {
        section.appendChild(result[n])
      }
    } else {
      section.appendChild(result)
      section.appendChild(
        dropZone(
          groupState.focused
            ? (groupState.withinFocused ? 'none' : 'move')
            : 'child',
          groupState.path.concat(
            'content', offset + group.content.length
          ),
          send
        )
      )
    }
    offset += group.content.length
  }

  if (showComments) {
    section.appendChild(commentsList(
      commentsHere, form.parentComment, digest, send
    ))
  }

  if (isFocused) {
    section.appendChild(commentForm(digest, false, send))
  }

  return section

  function toggleFocus (event) {
    event.stopPropagation()
    send('form:focus', isFocused ? null : form.path)
  }
}

function sectionButton (toggleFocus) {
  var a = document.createElement('a')
  a.className = 'sigil'
  a.onclick = toggleFocus
  a.title = 'Click to focus.'
  a.appendChild(document.createTextNode('§'))
  return a
}

function editControls (form, send) {
  assert(typeof send === 'function')
  var conspicuous = form.tree.form && 'conspicuous' in form.tree.form
  var div = document.createElement('div')
  div.className = 'editControls'
  div.appendChild(deleteButton(form.path, send))
  div.appendChild(conspicuousToggle(conspicuous, form.path, send))
  div.appendChild(replace(form.path, true, send))
  div.appendChild(replace(form.path, false, send))
  return div
}

function conspicuousToggle (conspicuous, path, send) {
  assert(conspicuous === true || conspicuous === false)
  assert(Array.isArray(path))
  assert(typeof send === 'function')
  var button = document.createElement('button')
  button.onclick = function () {
    send('form:conspicuous', {
      path: path,
      conspicuous: !conspicuous
    })
  }
  button.appendChild(
    document.createTextNode(
      conspicuous ? 'Inconspicuous' : 'Conspicuous'
    )
  )
  return button
}

function replace (path, digest, send) {
  assert(Array.isArray(path))
  assert(digest === true || digest === false)
  assert(typeof send === 'function')
  var button = document.createElement('button')
  button.onclick = function () {
    send('form:replace', {
      path: path,
      digest: digest
    })
  }
  button.appendChild(
    document.createTextNode(
      'Replace w/ ' + (digest ? 'Digest' : 'Publication')
    )
  )
  return button
}

function deleteButton (path, send) {
  var button = document.createElement('button')
  button.onclick = function (event) {
    event.preventDefault()
    send('form:splice', {path: path})
  }
  button.appendChild(document.createTextNode(('Delete')))
  return button
}

function marginalia (
  tree, path, blanks, annotations, hasComment, toggleFocus
) {
  var hasError = false
  var hasAnnotation = false
  for (var i = 0; i < annotations.length; i++) {
    var a = annotations[i]
    if (a.level === 'error') {
      hasError = true
    } else {
      hasAnnotation = true
    }
    if (hasError && hasAnnotation) {
      break
    }
  }
  var hasBlank = false
  for (var n = 0; n < tree.content.length; n++) {
    var element = tree.content[n]
    if (predicates.blank(element)) {
      for (var j = 0; j < blanks.length; j++) {
        var direction = blanks[j]
        var blankPath = path.concat('form', 'content', n)
        if (!deepEqual(direction.blank, blankPath)) {
          hasBlank = true
          break
        }
      }
    }
    if (hasBlank) {
      break
    }
  }
  if (hasError || hasAnnotation || hasBlank) {
    var aside = document.createElement('aside')
    aside.className = 'marginalia'
    aside.onclick = toggleFocus
    if (hasError) {
      aside.appendChild(flag('error', '\u26A0'))
    }
    if (hasAnnotation) {
      aside.appendChild(flag('annotation', '\u2690'))
    }
    if (hasBlank) {
      aside.appendChild(flag('blank', '\u270D'))
    }
    if (hasComment) {
      aside.appendChild(flag('comment', '\u2696'))
    }
    return aside
  } else {
    return null
  }
}

function flag (type, character) {
  var a = document.createElement('a')
  a.className = 'flag'
  a.title = 'Click to show ' + type + 's here.'
  a.appendChild(document.createTextNode(character))
  return a
}

function heading (heading, send) {
  var input = document.createElement('input')
  input.setAttribute('type', 'text')
  input.className = 'heading'
  input.setAttribute('placeholder', 'Click to add heading')
  if (heading) {
    input.id = 'Heading:' + heading
  }
  input.onchange = function (event) {
    send(event.target.value)
  }
  input.value = heading || ''
  return input
}

function series (state, send) {
  var returned = []
  var content = state.data.content
  for (var index = 0; index < content.length; index++) {
    var child = content[index]
    var absoluteIndex = index + state.offset
    var pathSuffix = ['content', absoluteIndex]
    var result = form(
      {
        mode: state.mode,
        blanks: state.blanks,
        comments: state.comments,
        tree: child,
        annotations: get(
          state.annotations, ['content', absoluteIndex], {}
        ),
        merkle: state.merkle.content[absoluteIndex],
        focused: state.focused,
        withinFocused: state.withinFocused,
        parentComment: state.parentComment,
        path: state.path.concat(pathSuffix)
      },
      send
    )
    returned.push(result)
    returned.push(
      dropZone(
        state.focused
          ? (state.withinFocused ? 'none' : 'move')
          : 'child',
        state.path.concat('content', absoluteIndex + 1),
        send
      )
    )
  }
  return returned
}

function paragraph (state, send) {
  var elementCount = state.data.content.length
  var offset = state.offset
  var onBlur = function (event) {
    event.stopPropagation()
    send('form:edit', {
      element: event.target,
      context: state.path.concat('content'),
      offset: offset,
      count: elementCount
    })
  }
  var onKeyDown = function (event) {
    if (event.which === 13 /* RETURN */) {
      event.preventDefault()
      event.stopPropagation()
      event.target.blur()
    }
  }
  var returned = document.createElement('p')
  returned.className = 'text'
  returned.contentEditable = 'true'
  returned.onblur = onBlur
  returned.onkeydown = onKeyDown
  var content = state.data.content
  var hasBlank = false
  for (var index = 0; index < content.length; index++) {
    var element = content[index]
    if (predicates.text(element)) {
      returned.appendChild(string(element))
    } else if (predicates.use(element)) {
      returned.appendChild(use(element.use))
    } else if (predicates.definition(element)) {
      returned.appendChild(definition(element.definition))
    } else if (predicates.blank(element)) {
      hasBlank = true
      var elementPath = state.path
        .concat('content', offset + index)
      returned.appendChild(blank(state.blanks, elementPath, send))
    } else if (predicates.reference(element)) {
      returned.appendChild(reference(element.reference))
    }
  }
  returned.dataset.hasBlank = String(hasBlank)

  returned.isSameNode = function (target) {
    return (
      target && target.nodeName && target.nodeName === 'P' &&
      target.className === 'text' &&
      target.parentNode.dataset.digest === state.parentDigest &&
      hasBlank === false &&
      target.dataset.hasBlank === 'false'
    )
  }

  return returned
}

function string (string) {
  return document.createTextNode(improvePunctuation(string))
}

function blank (blanks, path, send) {
  var direction = find(blanks, function (element) {
    return deepEqual(element.blank, path)
  })
  var value = direction
    ? improvePunctuation(direction.value)
    : ''
  return input(
    value,
    function (value) {
      send('form:blank', {
        path: path,
        value: replaceUnicode(value)
      })
    },
    function () {
      send('form:blank', {
        path: path,
        value: null
      })
    }
  )
}

function commentsList (comments, parent, digest, send) {
  var roots = comments
    .filter(function (comment) {
      return comment.replyTo.length === 0
    })
    .sort(function (a, b) {
      return parseInt(a.timestamp) - parseInt(b.timestamp)
    })
  var ol = document.createElement('ol')
  ol.className = 'comments'
  for (var index = 0; index < roots.length; index++) {
    ol.appendChild(
      commentListItem(
        roots[index], [], comments, digest, parent, send
      )
    )
  }
  return ol
}

function commentListItem (
  comment, parents, other, digest, parent, send
) {
  var withParent = [comment.uuid].concat(parents)
  var replies = other.filter(function (comment) {
    return equalArrays(
      comment.replyTo.slice(0, withParent.length),
      withParent
    )
  })
  var uuid = comment.uuid

  var reply = parent && uuid === parent.uuid
    ? commentForm(digest, {
      context: comment.context,
      replyTo: withParent
    }, send)
    : replyButton()

  return h('li', {'data-uuid': uuid},
    improvePunctuation(comment.text),
    h('span.byline',
      publisherLink(comment.publisher),
      new Date(parseInt(comment.timestamp)).toLocaleString()
    ),
    h('div.buttons', reply),
    (replies.length === 0
      ? null
      : replies.map(function (reply) {
        return commentListItem(
          reply, withParent, other, digest, parent, send
        )
      })
    )
  )

  function replyButton () {
    var button = document.createElement('button')
    button.onclick = function (event) {
      event.preventDefault()
      event.stopPropagation()
      send('form:reply to', comment)
    }
    button.appendChild(document.createTextNode('Reply'))
    return button
  }
}

function equalArrays (a, b) {
  return (
    a.length === b.length &&
    a.every(function (fromA, index) {
      return fromA === b[index]
    })
  )
}

function commentForm (digest, parent, send) {
  assert(typeof digest === 'string')
  assert(typeof send === 'function')
  var context
  if (!parent) {
    context = h('p',
      h('label', {for: 'context'},
        'Comment on this form: '
      ),
      h('select', {name: 'context'},
        h('option', {value: 'root'}, 'In this context'),
        h('option', {value: digest, selected: 'selected'},
          'Anywhere it appears'
        )
      )
    )
  }

  return h('form.newComment', {onsubmit: onSubmit},
    context,
    h('textarea', {required: 'required', name: 'text'}),
    h('p',
      h('input', {
        type: 'text',
        required: 'required',
        placeholder: 'Publisher Name',
        name: 'publisher'
      }),
      h('input', {
        type: 'password',
        required: 'required',
        placeholder: 'Password',
        name: 'password'
      }),
      h('button', {type: 'submit'}, 'Publish Comment')
    )
  )

  function onSubmit (event) {
    event.preventDefault()
    event.stopPropagation()
    var target = event.target
    var elements = target.elements
    send('form:comment', {
      context: parent ? parent.context : elements.context.value,
      form: digest,
      replyTo: parent ? parent.replyTo : [],
      text: elements.text.value,
      publisher: elements.publisher.value,
      password: elements.password.value
    })
  }
}
