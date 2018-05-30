var classnames = require('classnames')
var editionLink = require('./edition-link')
var escape = require('../../util/escape')
var group = require('commonform-group-series')
var html = require('../html')
var longDate = require('../../util/long-date')
var merkleize = require('commonform-merkleize')
var predicate = require('commonform-predicate')
var publicationLink = require('./publication-link')
var publisherLink = require('./publisher-link')
var samePath = require('commonform-same-path')

module.exports = function (form, loaded, options) {
  options = options || {}
  if (!options.mappings) options.mappings = []
  if (!options.annotations) options.annotations = []
  if (!options.comments) options.comments = []
  var tree = options.tree = merkleize(loaded.form)
  return html`
    ${renderTableOfContents(form)}
    <article class=commonform>
      ${renderForm(0, [], form, loaded.form, tree, loaded.resolutions, options)}
    </article>
    ${scriptTag(form, loaded, options)}
  `
}

function renderTableOfContents (form) {
  if (!containsHeading(form)) return ''
  return html`<header class=toc>
    <h2>Contents</h2>
    ${renderContents(form)}
  </header>`
}

function renderContents (form) {
  if (!containsHeading(form)) return ''
  return html`<ol class=toc id=toc>${
    form.content.reduce(function (items, element) {
      if (!element.hasOwnProperty('form')) return items
      var hasHeading = (
        element.hasOwnProperty('heading') ||
        containsHeading(element.form)
      )
      if (!hasHeading) return items
      var li = '<li>'
      if (element.hasOwnProperty('heading')) {
        li += renderReference(element.heading)
      } else {
        li += '(No Heading)'
      }
      li += renderContents(element.form)
      li += '</li>'
      return items.concat(li)
    }, [])}</ol>`
}

function containsHeading (form) {
  return form.content.some(function (element) {
    return (
      element.hasOwnProperty('form') &&
      (
        element.hasOwnProperty('heading') ||
        containsHeading(element.form)
      )
    )
  })
}

function renderForm (depth, path, form, loaded, tree, resolutions, options) {
  var offset = 0
  var annotationsHere = options.annotations.filter(function (annotation) {
    return samePath(annotation.path.slice(0, -2), path)
  })
  var digest = tree.digest
  var commentsHere = options.comments.filter(function (comment) {
    return comment.form === digest
  })
  var formGroups = form && group(form)
  var loadedGroups = group(loaded)
    .map(function (loadedGroup, index) {
      var formGroup = formGroups && formGroups[index]
      var returned = loadedGroup.type === 'series'
        ? renderSeries(
          depth + 1,
          offset,
          path,
          formGroup,
          loadedGroup,
          tree,
          resolutions,
          options
        )
        : renderParagraph(offset, path, loadedGroup, tree, options)
      offset += loadedGroup.content.length
      return returned
    })
    .join('')
  return html`
    ${renderAnnotations(annotationsHere)}
    ${loadedGroups}
    ${renderComments(commentsHere, options)}
  `
}

function renderCommentForm (options) {
  var context = ''
  if (options.context) {
    context = html`
      <input type=hidden name=context value=${options.context}>
    `
  } else {
    context = html`
      <p>
        <label>
          Comment on this form:
          <select name=context>
            <option value=${options.root}>in this context</option>
            <option value=${options.form} selected>anywhere it appears</option>
          </select>
        </label>
      </p>
    `
  }

  var replyTos = ''
  if (options.replyTo) {
    replyTos = options.replyTo.map(function (uuid) {
      return `<input type=hidden name="replyTo[]" value="${uuid}">`
    })
  }

  return html`
    <button class="commentButton yesscript">
      ${options.replyTo ? 'Add a Reply' : 'Add a Comment'}
    </button>
    <form class="comment commentForm hidden" action=/comment method=post>
      ${context}
      ${replyTos}
      <input type=hidden name=form value=${options.form}>
      <textarea name=text required></textarea>
      <input type=text name=publisher placeholder="Publisher Name" autocomplete=username required>
      <input type=password name=password placeholder="Password" autocomplete=password required>
      <label>
        <input type=checkbox name=subscribe>
        E-Mail Notifications
      </label>
      <button type=submit>Publish Comment</button>
    </form>
  `
}

function renderComments (comments, options) {
  var roots = comments
    .filter(function (comment) {
      return comment.replyTo.length === 0
    })
    .sort(function (a, b) {
      return parseInt(a.timestamp) - parseInt(b.timestamp)
    })
  return roots
    .map(function (comment) {
      return renderComment(comment, [], comments, options)
    })
    .join('')
}

function renderComment (comment, parents, comments, options) {
  var uuid = comment.uuid
  var withParent = [uuid].concat(parents)
  var replies = comments.filter(function (comment) {
    var slice = comment.replyTo.slice(0, withParent.length)
    return (
      withParent.length === slice.length &&
      slice.every(function (element, index) {
        return element === withParent[index]
      })
    )
  })
  var children = replies.map(function (reply) {
    return renderComment(reply, withParent, comments, options)
  })
  if (options.commentUI) {
    var replyForm = renderCommentForm({
      form: comment.form,
      root: options.tree.digest,
      context: comment.context,
      replyTo: withParent
    })
  }
  return html`
    <aside class=comment id=${uuid}>
      <p>${escape(comment.text)}</p>
      <p class=byline>
        &mdash;&nbsp;${publisherLink(comment.publisher)},
        ${escape(longDate(new Date(parseInt(comment.timestamp))))}
      </p>
      ${children}
      ${options.commentUI && replyForm}
    </aside>
  `
}

function renderAnnotations (annotations) {
  return annotations
    .map(function (annotation) {
      var classes = 'annotation ' + annotation.level
      return html`
        <aside class="${classes}">
          <p>${escape(annotation.message)}</p>
        </aside>
      `
    })
    .join('')
}

function renderSeries (depth, offset, path, formSeries, loadedSeries, tree, resolutions, options) {
  return loadedSeries.content
    .map(function (loadedChild, index) {
      var loadedForm = loadedChild.form
      var childTree = tree.content[offset + index]
      var digest = childTree.digest
      var childPath = path.concat('content', offset + index)
      var resolution = resolutions.find(function (resolution) {
        return samePath(resolution.path, childPath)
      })
      var classes = classnames({
        conspicuous: loadedForm.conspicuous,
        component: resolution
      })
      return (
        `<section class="${classes}">` +
        ('heading' in loadedChild ? renderHeading(depth, loadedChild.heading) : '') +
        (resolution ? resolutionLink(resolution) : '') +
        (
          options.childLinks
            ? `<a class=child-link href=/forms/${digest}>${digest}</a>`
            : ''
        ) +
        renderForm(
          depth,
          childPath.concat('form'),
          formSeries ? formSeries.content[index].form : null,
          loadedForm,
          childTree,
          resolutions,
          options
        ) +
        (
          options.commentUI
            ? renderCommentForm({
              root: options.tree.digest,
              form: digest
            })
            : ''
        ) +
        '</section>'
      )
    })
    .join('')
}

function resolutionLink (resolution) {
  var returned = publicationLink(resolution)
  if (resolution.upgrade && resolution.specified !== resolution.edition) {
    returned += ` (upgraded from ${editionLink({
      publisher: resolution.publisher,
      project: resolution.project,
      edition: resolution.specified
    })})`
  }
  return returned
}

function renderHeading (depth, heading) {
  return `<h1 class=heading id="heading:${encodeURIComponent(heading)}">${escape(heading)}</h1>`
}

function renderParagraph (offset, path, paragraph, tree, options) {
  return (
    '<p>' +
    paragraph.content
      .map(function (element, index) {
        if (predicate.text(element)) {
          return escape(element)
        } else if (predicate.use(element)) {
          let term = element.use
          let href = `#definition:${encodeURIComponent(term)}`
          return `<a class=use href="${href}">${escape(term)}</a>`
        } else if (predicate.definition(element)) {
          let term = element.definition
          let id = `definition:${encodeURIComponent(term)}`
          return `<dfn id="${id}">${escape(term)}</dfn>`
        } else if (predicate.blank(element)) {
          let blankPath = JSON.stringify(path.concat('content', offset + index))
          let value = matchingValue(blankPath, options.mappings)
          if (value) {
            return `<input type=text class=blank data-path='${blankPath}' value="${escape(value)}" disabled>`
          } else {
            return `<input type=text class=blank data-path='${blankPath}' disabled>`
          }
        } else if (predicate.reference(element)) {
          return renderReference(element.reference)
        }
      })
      .join('') +
    '</p>'
  )
}

function renderReference (heading) {
  return `<a class=reference href="#heading:${encodeURIComponent(heading)}">${escape(heading)}</a>`
}

function matchingValue (path, mappings) {
  var length = mappings.length
  for (var index = 0; index < length; index++) {
    var mapping = mappings[index]
    if (samePath(mapping.blank, path)) return mapping.value
  }
}

function scriptTag (form, loaded, options) {
  return `
    <script>window.form = ${JSON.stringify(form)}</script>
    <script>window.loaded = ${JSON.stringify(loaded)}</script>
    <script>window.mappings = ${JSON.stringify(options.mappings)}</script>
    <script>window.annotations = ${JSON.stringify(options.annotations)}</script>
    <script>window.tree = ${JSON.stringify(options.tree)}</script>
  `
}
