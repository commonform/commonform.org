var assert = require('assert')
var classnames = require('classnames')
var deepEqual = require('deep-equal')
var definition = require('./definition')
var details = require('./details')
var dropZone = require('./drop-zone')
var find = require('array-find')
var get = require('keyarray').get
var groupSeries = require('commonform-group-series')
var h = require('../h')
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
  var containsFocused = (
    isFocused ||
    (
      form.focused &&
      deepEqual(form.path, form.focused.slice(0, form.path.length))
    )
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

  var offset = 0

  var section = h('section',
    {
      className: classnames({
        conspicuous: 'conspicuous' in tree,
        focused: isFocused
      }),
      // Encode some facts about the state that produced
      // the element in its `dataset`, so we can refer to
      // compare them after the next render in `isSameNode`.
      'data-digest': digest,
      'data-commentsHere': String(commentsHere),
      'data-containsFocused': String(containsFocused)
    },
    [
      !root ? sectionButton(toggleFocus) : null,
      isFocused ? editControls(form, send) : null,
      (!root && (form.tree.heading || isFocused || form.withinFocused))
        ? heading(form.tree.heading, function (newValue) {
          send('form:heading', {
            path: form.path,
            heading: newValue
          })
        })
        : null,
      isFocused ? details(digest, annotationsHere, send) : null,
      marginalia(
        tree, form.path, form.blanks,
        annotationsHere,
        (commentsHere && commentsHere.length !== 0),
        toggleFocus
      ),
      (groups[0].type === 'series')
        ? dropZone(
          form.focused
            ? ((isFocused || form.withinFocused) ? 'none' : 'move')
            : 'child',
          form.path.concat(formKey, 'content', 0),
          send
        )
        : null,
      groups.map(function eachGroup (group) {
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
        offset += group.content.length
        if (group.type === 'series') {
          groupState.merkle = form.merkle
          return series(groupState, send)
        } else {
          return [
            paragraph(groupState, send),
            dropZone(
              groupState.focused
                ? (groupState.withinFocused ? 'none' : 'move')
                : 'child',
              groupState.path.concat(
                'content', groupState.offset + group.content.length
              ),
              send
            )
          ]
        }
      }),
      showComments
        ? commentsList(commentsHere, form.parentComment, digest, send)
        : null ,
      isFocused ? commentForm(digest, false, send) : null
    ]
  )

  section.isSameNode = function (target) {
    return (
      // Section element.
      target &&
      target.nodeName &&
      target.nodeName === 'SECTION' &&
      target.dataset.digest === digest &&
      // No comments.
      commentsHere === false &&
      target.dataset.commentsHere === 'false' &&
      // Does not contain focused form.
      containsFocused === false &&
      target.dataset.containsFocused === 'false'
    )
  }

  return section

  function toggleFocus (event) {
    event.stopPropagation()
    send('form:focus', isFocused ? null : form.path)
  }
}

function sectionButton (toggleFocus) {
  return h('a.sigil', {
    onclick: toggleFocus,
    title: 'Click to focus.'
  }, '§')
}

function editControls (form, send) {
  assert(typeof send === 'function')
  var conspicuous = form.tree.form && 'conspicuous' in form.tree.form
  return h('div.editControls', {key: 'editControls'}, [
    deleteButton(form.path, send),
    conspicuousToggle(conspicuous, form.path, send),
    replace(form.path, true, send),
    replace(form.path, false, send)
  ])
}

function conspicuousToggle (conspicuous, path, send) {
  assert(conspicuous === true || conspicuous === false)
  assert(Array.isArray(path))
  assert(typeof send === 'function')
  return h('button',
    {
      onclick: function () {
        send('form:conspicuous', {
          path: path,
          conspicuous: !conspicuous
        })
      }
    },
    conspicuous ? 'Inconspicuous' : 'Conspicuous'
  )
}

function replace (path, digest, send) {
  assert(Array.isArray(path))
  assert(digest === true || digest === false)
  assert(typeof send === 'function')
  return h('button',
    {
      onclick: function () {
        send('form:replace', {
          path: path,
          digest: digest
        })
      }
    },
    'Replace w/ ' + (digest ? 'Digest' : 'Publication')
  )
}

function deleteButton (path, send) {
  return h('button', {
    onclick: function (event) {
      event.preventDefault()
      send('form:splice', {path: path})
    }
  }, 'Delete')
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
    return h('aside.marginalia', {onclick: toggleFocus}, [
      hasError ? flag('error', '\u26A0') : null,
      hasAnnotation ? flag('annotation', '\u2690') : null,
      hasBlank ? flag('blank', '\u270D') : null,
      hasComment ? flag('comment', '\u2696') : null
    ])
  } else {
    return null
  }
}

function flag (type, character) {
  return h('a.flag', {
    title: 'Click to show ' + type + 's here.'
  }, character)
}

function heading (heading, send) {
  return h('input.heading', {
    type: 'text',
    placeholder: 'Click to add heading.',
    id: 'Heading:' + heading,
    onchange: function (event) {
      send(event.target.value)
    },
    value: heading || ''
  })
}

function series (state, send) {
  return state.data.content.map(function eachChild (child, index) {
    var absoluteIndex = index + state.offset
    return [
      form({
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
        path: state.path.concat(['content', absoluteIndex])
      }, send),
      dropZone(
        state.focused
          ? (state.withinFocused ? 'none' : 'move')
          : 'child',
        state.path.concat('content', absoluteIndex + 1),
        send
      )
    ]
  })
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
  var hasBlank = false
  var content = state.data.content
  var returned = h('p.text',
    {
      contenteditable: true,
      onblur: onBlur,
      onkeydown: onKeyDown,
      'data-hasBlank': String(hasBlank)
    },
    content.map(function eachElement (element, index) {
      if (predicates.text(element)) {
        return improvePunctuation(element)
      } else if (predicates.use(element)) {
        return use(element.use)
      } else if (predicates.definition(element)) {
        return definition(element.definition)
      } else if (predicates.blank(element)) {
        hasBlank = true
        var elementPath = state.path.concat('content', offset + index)
        return blank(state.blanks, elementPath, send)
      } else if (predicates.reference(element)) {
        return reference(element.reference)
      }
    })
  )

  returned.isSameNode = function (target) {
    return (
      target &&
      target.nodeName &&
      target.nodeName === 'P' &&
      target.className === 'text' &&
      target.parentNode.dataset.digest === state.parentDigest &&
      hasBlank === false &&
      target.dataset.hasBlank === 'false'
    )
  }

  return returned
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
  return h('ol.comments',
    roots.map(function (root) {
      return commentListItem(
        roots[index], [], comments, digest, parent, send
      )
    })
  )
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
    h('span.byline', [
      publisherLink(comment.publisher),
      new Date(parseInt(comment.timestamp)).toLocaleString()
    ]),
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
    return h('button', {
      onclick: function (event) {
        event.preventDefault()
        event.stopPropagation()
        send('form:reply to', comment)
      }
    }, 'Reply')
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
    context = h('p', [
      h('label', {for: 'context'},
        'Comment on this form: '
      ),
      h('select', {name: 'context'}, [
        h('option', {value: 'root'}, 'In this context'),
        h('option', {value: digest, selected: 'selected'},
          'Anywhere it appears'
        )
      ])
    ])
  }

  return h('form.newComment', {onsubmit: onSubmit}, [
    context,
    h('textarea', {required: 'required', name: 'text'}),
    h('p', [
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
    ])
  ])

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
