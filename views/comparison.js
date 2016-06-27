const choo = require('choo')
const classnames = require('classnames')
const clone = require('../clone')
const group = require('commonform-group-series')
const predicates = require('commonform-predicate')
const definition = require('./definition')
const reference = require('./reference')
const use = require('./use')

const view = choo.view.bind(choo)

module.exports = comparison

function comparison (diff) {
  const root = !diff.hasOwnProperty('form')
  const treeLike = root ? diff : diff.form
  const groups = group(clone(treeLike))
  var wrapper
  if (diff.hasOwnProperty('inserted')) {
    wrapper = (argument) => view`<ins>${argument}</ins>`
  } else if (diff.hasOwnProperty('deleted')) {
    wrapper = (argument) => view`<del>${argument}</del>`
  } else {
    wrapper = (argument) => argument
  }
  const conspicuous = treeLike.conspicuous
  const madeConspicuous =
    conspicuous.length === 1 &&
    conspicuous[0].hasOwnProperty('inserted')
  const madeInconspicuous =
    conspicuous.length === 1 &&
    conspicuous[0].hasOwnProperty('deleted')

  const classNames = classnames({
    conspicuous: conspicuous.some((element) =>
      !element.hasOwnProperty('deleted'))
  })

  return view`
    <section class=${classNames}>
      ${
        wrapper(
          view`
            <div>
              ${root ? null : view`<a class=sigil>\u00A7</a>`}
              ${
                Array.isArray(diff.heading)
                  ? heading(diff.heading)
                  : null}
              ${
                madeInconspicuous
                  ? view`<p class=edit>Made inconspicuous.</p>`
                  : null
              }
              ${
                madeConspicuous
                  ? view`<p class=edit>Made conspicuous.</p>`
                  : null
              }
              ${
                groups.map((group) => {
                  const renderer = group.type === 'series' ? series : paragraph
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
  const joined = heading.map((word) => word.word).join('')
  return view`
    <p class=heading id=${joined}>
      ${heading.map(word)}
    </p>
  `
}

function word (word) {
  if (word.inserted) return view`<ins>${word.word}</ins>`
  else if (word.deleted) return view`<del>${word.word}</del>`
  else return view`<span>${word.word}</span>`
}

function series (data) { return data.content.map((child) => comparison(child)) }

function paragraph (data) {
  return view`
    <p class=text>
      ${
        data.content.reduce((output, child) => {
          var wrapper
          if (child.hasOwnProperty('inserted')) {
            wrapper = (argument) => view`<ins>${argument}</ins>`
          } else if (child.hasOwnProperty('deleted')) {
            wrapper = (argument) => view`<del>${argument}</del>`
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
                wrapper(view`<span>${child.word}</span>`))
            }
          } else if (predicates.use(child)) {
            return output.concat(wrapper(use(child.use)))
          } else if (predicates.definition(child)) {
            return output.concat(wrapper(definition(child.definition)))
          } else if (predicates.blank(child)) {
            return output.concat(view`<span class=blank></span>`)
          } else if (predicates.reference(child)) {
            return output.concat(reference(child.reference))
          }
        }, [ ])
      }
    </p>
  `
}

function doNotWrap (argument) { return argument }
