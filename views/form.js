var assert = require('assert')
var classnames = require('classnames')
var clone = require('../utilities/clone')
var deepEqual = require('deep-equal')
var definition = require('./definition')
var details = require('./details')
var dropZone = require('./drop-zone')
var find = require('array-find')
var get = require('keyarray').get
var group = require('commonform-group-series')
var html = require('../html')
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
  var groups = group(clone(tree))
  var isFocused = deepEqual(form.focused, form.path)
  var annotationsHere = get(
    form.annotations,
    formKey.concat('annotations'),
    []
  )
  var commentsHere = form.comments
    ? form.comments.filter(function (comment) {
      return comment.form === form.merkle.digest
    })
    : false
  var showComments = (
    (root || isFocused || form.withinFocused) &&
    commentsHere &&
    commentsHere.length !== 0
  )
  var classes = classnames({
    conspicuous: 'conspicuous' in tree,
    focused: isFocused
  })

  var setHeading = function (newValue) {
    send('form:heading', {
      path: form.path,
      heading: newValue
    })
  }

  var digest = form.merkle.digest

  var offset = 0
  return html.collapseSpace`
    <section
        class="${classes}"
        data-digest="${digest}">
      ${root ? null : sectionButton(toggleFocus)}
      ${isFocused ? editControls(form, send) : null}
      ${
        root
          ? null
          : heading(
            form.mode,
            isFocused || form.withinFocused,
            form.tree.heading,
            setHeading
          )
      }
      ${
        isFocused
          ? details(digest, annotationsHere, send)
          : null
      }
      ${
        marginalia(
          tree, form.path, form.blanks,
          annotationsHere,
          (commentsHere && commentsHere.length !== 0),
          toggleFocus
        )
      }
      ${
        groups[0].type === 'series'
          ? dropZone(
            form.focused
              ? ((isFocused || form.withinFocused) ? 'none' : 'move')
              : 'child',
            form.path.concat(formKey, 'content', 0),
            send
          )
          : null
      }
      ${groups.map(function (group) {
        var groupState = {
          mode: form.mode,
          comments: form.comments,
          blanks: form.blanks,
          data: group,
          annotations: get(form.annotations, formKey, {}),
          focused: form.focused,
          withinFocused: isFocused || form.withinFocused,
          parentComment: form.parentComment,
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
        offset += group.content.length
        return renderer === series
          ? [result]
          : [
            result,
            dropZone(
              groupState.focused
                ? (groupState.withinFocused ? 'none' : 'move')
                : 'child',
              groupState.path.concat(
                'content', groupState.offset + groupState.data.length
              ),
              send
            )
          ]
      }).reduce(function (x, y) { return x.concat(y) })}
      ${
        showComments
          ? commentsList(
            commentsHere, form.parentComment, digest, send
          )
          : null
      }
      ${
        isFocused
          ? commentForm(digest, false, send)
          : null
      }
    </section>
  `

  function toggleFocus (event) {
    event.stopPropagation()
    send('form:focus', isFocused ? null : form.path)
  }
}

function sectionButton (toggleFocus) {
  return html.collapseSpace`
    <a class=sigil
      onclick=${toggleFocus}
      title="Click to focus.">§</a>
  `
}

function editControls (form, send) {
  assert(typeof send === 'function')
  var conspicuous = form.tree.form && 'conspicuous' in form.tree.form
  return html.collapseSpace`
    <div class=editControls>
      ${deleteButton(form.path, send)}
      ${conspicuousToggle(conspicuous, form.path, send)}
      ${replace(form.path, true, send)}
      ${replace(form.path, false, send)}
    </div>
  `
}

function conspicuousToggle (conspicuous, path, send) {
  assert(conspicuous === true || conspicuous === false)
  assert(Array.isArray(path))
  assert(typeof send === 'function')
  return html.collapseSpace`
    <button onclick=${onClick}>
      ${conspicuous ? 'Inconspicuous' : 'Conspicuous'}
    </button>
  `
  function onClick (event) {
    send('form:conspicuous', {
      path: path,
      conspicuous: !conspicuous
    })
  }
}

function replace (path, digest, send) {
  assert(Array.isArray(path))
  assert(digest === true || digest === false)
  assert(typeof send === 'function')
  return html.collapseSpace`
    <button
        onclick=${onClick}
      >Replace w/ ${digest ? 'Digest' : 'Publication'}</button>
  `
  function onClick () {
    send('form:replace', {
      path: path,
      digest: digest
    })
  }
}

function deleteButton (path, send) {
  return html.collapseSpace`
    <button
        onclick=${onClick}
      >Delete</button>
  `
  function onClick (event) {
    event.preventDefault()
    send('form:splice', {path: path})
  }
}

function marginalia (
  tree, path, blanks, annotations, hasComment, toggleFocus
) {
  var hasError = annotations.some(function (a) {
    return a.level === 'error'
  })
  var hasAnnotation = annotations.some(function (a) {
    return a.level !== 'error'
  })
  var hasBlank = tree.content.some(function (element, index) {
    return (
      predicates.blank(element) &&
      !blanks.some(function (direction) {
        return deepEqual(
          direction.blank,
          path.concat('form', 'content', index)
        )
      })
    )
  })
  if (hasError || hasAnnotation || hasBlank) {
    return html.collapseSpace`
      <aside class=marginalia onclick=${toggleFocus}>
        ${hasError ? flag('error', '\u26A0') : null}
        ${hasAnnotation ? flag('annotation', '\u2690') : null}
        ${hasBlank ? flag('blank', '\u270D') : null}
        ${hasComment ? flag('comment', '\u2696') : null}
      </aside>
    `
  } else {
    return null
  }
}

function flag (type, character) {
  return html`
    <a
        class=flag
        title="Click to show ${type}s here."
      >${character}</a>
  `
}

function heading (mode, withinFocused, heading, send) {
  if (heading || withinFocused) {
    return html.collapseSpace`
      <input
          type=text
          class=heading
          placeholder="Click to add heading"
          id="Heading:${heading}"
          onchange=${function (event) {
            send(event.target.value)
          }}
          value=${heading || ''}/>
    `
  } else {
    return null
  }
}

function series (state, send) {
  return state.data.content.map(function (child, index) {
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
    return [
      result,
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
  return html`
    <p
        class=text
        contenteditable=true
        onblur=${onBlur}
        onkeydown=${onKeyDown}
      >${
        state.data.content.map(function (child, index) {
          if (predicates.text(child)) {
            return string(child)
          } else if (predicates.use(child)) {
            return use(child.use)
          } else if (predicates.definition(child)) {
            return definition(child.definition)
          } else if (predicates.blank(child)) {
            var childPath = state.path
              .concat('content', offset + index)
            return blank(state.blanks, childPath, send)
          } else if (predicates.reference(child)) {
            return reference(child.reference)
          }
        })
      }
    </p>
  `
}

function string (string) {
  return html`${improvePunctuation(string)}`
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
  return html.collapseSpace`
    <ol class=comments>
      ${roots.map(function (root) {
        return commentListItem(
          root, [], comments, digest, parent, send
        )
      })}
    </ol>
  `
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
    : html`<button onclick=${onClick}>Reply</button>`
  return html`
    <li data-uuid=${uuid}>
      ${improvePunctuation(comment.text)}
      <span class=byline>
        ${publisherLink(comment.publisher)}
        ${new Date(parseInt(comment.timestamp)).toLocaleString()}
      </span>
      <div class=buttons>
        ${reply}
      </div>
      ${
        replies.length === 0
          ? null
          : replies.map(function (reply) {
            return commentListItem(
              reply, withParent, other, digest, parent, send
            )
          })
      }
    </li>
  `

  function onClick (event) {
    event.preventDefault()
    event.stopPropagation()
    send('form:reply to', comment)
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
    context = html.collapseSpace`
      <p>
        <label for=context>Comment on this form:</label>
        <select name=context>
          <option value=root
            >Within this entire form</option>
          <option
              value=${digest}
              selected
            >Anywhere it appears</option>
        </select>
      </p>
    `
  }

  return html.collapseSpace`
    <form onsubmit=${onSubmit} class=newComment>
      ${context}
      <textarea required name=text></textarea>
      <p>
        <input
            type=text
            required
            placeholder="Publisher Name"
            name=publisher></input>
        <input
            type=password
            required
            placeholder="Password"
            name=password></input>
        <button type=submit>Publish Comment</button>
      </p>
    </form>
  `

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
