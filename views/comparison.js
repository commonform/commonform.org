var html = require('choo/html')
var classnames = require('classnames')
var clone = require('../utilities/clone')
var group = require('commonform-group-series')
var predicates = require('commonform-predicate')
var definition = require('./definition')
var reference = require('./reference')
var use = require('./use')

module.exports = comparison

function comparison (diff) {
  var root = !diff.hasOwnProperty('form')
  var treeLike = root ? diff : diff.form
  var groups = group(clone(treeLike))
  var wrapper
  if (diff.hasOwnProperty('inserted')) {
    wrapper = (argument) => html`<ins>${argument}</ins>`
  } else if (diff.hasOwnProperty('deleted')) {
    wrapper = (argument) => html`<del>${argument}</del>`
  } else {
    wrapper = (argument) => argument
  }
  var conspicuous = treeLike.conspicuous
  var madeConspicuous =
    conspicuous.length === 1 &&
    conspicuous[0].hasOwnProperty('inserted')
  var madeInconspicuous =
    conspicuous.length === 1 &&
    conspicuous[0].hasOwnProperty('deleted')

  var classNames = classnames({
    conspicuous: conspicuous.some((element) =>
      !element.hasOwnProperty('deleted'))
  })

  return html`
    <section class=${classNames}>
      ${
        wrapper(
          html`
            <div>
              ${root ? null : html`<a class=sigil>\u00A7</a>`}
              ${
                Array.isArray(diff.heading)
                ? heading(diff.heading)
                : null
              }
              ${
                madeInconspicuous
                ? html`<p class=edit>Made inconspicuous.</p>`
                : null
              }
              ${
                madeConspicuous
                ? html`<p class=edit>Made conspicuous.</p>`
                : null
              }
              ${
                groups.map(function (group) {
                  var renderer = group.type === 'series'
                  ? series
                  : paragraph
                  return renderer(group)
                })
              }
            </div>
          `
        )
      }
    </section>
  `
}

function heading (heading) {
  var joined = heading.map((word) => word.word).join('')
  return html`
    <p class=heading id=${joined}>
      ${heading.map(word)}
    </p>
  `
}

function word (word) {
  if (word.inserted) return html`<ins>${word.word}</ins>`
  else if (word.deleted) return html`<del>${word.word}</del>`
  else return html`<span>${word.word}</span>`
}

function series (data) {
  return data.content.map((child) => comparison(child))
}

function paragraph (data) {
  return html`
    <p class=text>
      ${
        data.content.reduce(function (output, child) {
          var wrapper
          if (child.hasOwnProperty('inserted')) {
            wrapper = (argument) => html`<ins>${argument}</ins>`
          } else if (child.hasOwnProperty('deleted')) {
            wrapper = (argument) => html`<del>${argument}</del>`
          } else {
            wrapper = doNotWrap
          }

          if (child.hasOwnProperty('word')) {
            if (wrapper === doNotWrap) {
              var last = output[output.length - 1]
              if (typeof last === 'string') {
                output[output.length - 1] = last + child.word
                return output
              } else {
                return output.concat(child.word)
              }
            } else {
              return output.concat(
                wrapper(html`<span>${child.word}</span>`))
            }
          } else if (predicates.use(child)) {
            return output.concat(wrapper(use(child.use)))
          } else if (predicates.definition(child)) {
            return output.concat(wrapper(definition(child.definition)))
          } else if (predicates.blank(child)) {
            return output.concat(html`<span class=blank></span>`)
          } else if (predicates.reference(child)) {
            return output.concat(reference(child.reference))
          }
        }, [])
      }
    </p>
  `
}

function doNotWrap (argument) {
  return argument
}
