var classnames = require('classnames')
var diff = require('commonform-diff')
var get = require('simple-get')
var group = require('commonform-group-series')
var internalError = require('./internal-error')
var loadComponents = require('commonform-load-components')
var methodNotAllowed = require('./method-not-allowed')
var predicate = require('commonform-predicate')
var runAuto = require('run-auto')
var sanitize = require('../util/sanitize')

var footer = require('./partials/footer')
var html = require('./html')
var preamble = require('./partials/preamble')

module.exports = function (configuration, request, response) {
  if (request.method === 'GET') {
    return getResponse.apply(this, arguments)
  } else {
    return methodNotAllowed.apply(null, arguments)
  }
}

function getResponse (configuration, request, response) {
  var from = sanitize(request.params.from)
  var to = sanitize(request.params.to)
  runAuto({
    from: function (done) {
      get.concat({
        url: configuration.api + '/forms/' + from,
        json: true
      }, function (error, response, form) {
        if (error) return done(error)
        loadComponents(form, {}, function (error, loaded) {
          done(error, loaded)
        })
      })
    },
    to: function (done) {
      get.concat({
        url: configuration.api + '/forms/' + to,
        json: true
      }, function (error, response, form) {
        if (error) return done(error)
        loadComponents(form, {}, function (error, loaded) {
          done(error, loaded)
        })
      })
    }
  }, function (error, data) {
    if (error) {
      return internalError(configuration, request, response, error)
    }
    var comparison = diff(data.from, data.to)
    response.setHeader('Content-Type', 'text/html; charset=UTF-8')
    response.end(html`
    ${preamble()}
    <main>
      <header>
        <a class=digest href=/forms/${from}>${from}</a>
        versus
        <a class=digest href=/forms/${to}>${to}</a>
      </header>
      <article class="commonform diff">${render(comparison)}</article>
    </main>
    ${footer()}
    `)
  })
}

function clone (x) {
  return JSON.parse(JSON.stringify(x))
}

function render (diff) {
  var root = !diff.hasOwnProperty('form')
  var treeLike = root ? diff : diff.form
  var groups = group(clone(treeLike))
  var wrapper
  if (diff.hasOwnProperty('inserted')) wrapper = ins
  else if (diff.hasOwnProperty('deleted')) wrapper = del
  else wrapper = doNotWrap
  var conspicuous = treeLike.conspicuous
  var madeConspicuous = (
    conspicuous.length === 1 &&
    conspicuous[0].hasOwnProperty('inserted')
  )
  var madeInconspicuous = (
    conspicuous.length === 1 &&
    conspicuous[0].hasOwnProperty('deleted')
  )
  var classNames = classnames({
    conspicuous: conspicuous.some(function (element) {
      return !element.hasOwnProperty('deleted')
    }),
    changed: isChanged(diff)
  })

  var content = wrapper(
    (Array.isArray(diff.heading) ? heading(diff.heading) : '') +
    (madeInconspicuous ? '<p class=edit>Made inconspicuous</p>' : '') +
    (madeConspicuous ? '<p class=edit>Made conspicuous</p>' : '') +
    groups
      .map(function (group) {
        return group.type === 'series' ? series(group) : paragraph(group)
      })
      .join('')
  )

  return `<section class="${classNames}">${content}</section>`
}

function heading (heading) {
  var classNames = classnames({
    heading: true,
    changed: heading.some(isChanged)
  })
  return `<p class="${classNames}">${heading.map(word).join('')}</p>`
}

function word (word) {
  if (word.inserted) return ins(word.word)
  else if (word.deleted) return del(word.word)
  else return word.word
}

function series (data) {
  return data.content
    .map(function (child) {
      return render(child)
    })
    .join('')
}

function paragraph (data) {
  var changed = isChanged(data) || data.content.some(isChanged)
  var classNames = classnames({
    text: true,
    changed
  })
  var content = data.content
    .reduce(function (output, child) {
      var wrapper
      if (child.hasOwnProperty('inserted')) wrapper = ins
      else if (child.hasOwnProperty('deleted')) wrapper = del
      else wrapper = doNotWrap
      if (child.hasOwnProperty('word')) {
        return output.concat(wrapper(child.word))
      } else if (predicate.use(child)) {
        return output.concat(wrapper(use(child.use)))
      } else if (predicate.definition(child)) {
        return output.concat(wrapper(definition(child.definition)))
      } else if (predicate.blank(child)) {
        return output.concat(wrapper(`<span class=blank></span>`))
      } else if (predicate.reference(child)) {
        return output.concat(wrapper(reference(child.reference)))
      }
    }, [])
    .join('')
  return `<p class="${classNames}">${content}</p>`
}

function isChanged (argument) {
  return argument.hasOwnProperty('inserted') || argument.hasOwnProperty('deleted')
}

function doNotWrap (argument) {
  return argument
}

function ins (argument) {
  return `<ins>${argument}</ins>`
}

function del (argument) {
  return `<del>${argument}</del>`
}

function use (term) {
  return `<span class=use>${term}</span>`
}

function definition (term) {
  return `<dfn>${term}</dfn>`
}

function reference (heading) {
  return `<span class=reference>${heading}</span>`
}
