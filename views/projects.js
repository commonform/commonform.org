var assert = require('assert')
var compare = require('reviewers-edition-compare')
var footer = require('./footer')
var h = require('../h')
var loading = require('./loading')
var sidebar = require('./sidebar')

module.exports = function projects (publisher, state, send) {
  assert(typeof publisher === 'string')
  assert(typeof state === 'object')
  assert(typeof send === 'function')
  var haveData = state.publisher === publisher && state.projects
  if (!haveData) {
    return loading('browse', function () {
      send('browser:get projects', publisher)
    })
  } else {
    return h('div.container', [
      h('article.commonform', [
        sidebar('browse', send),
        h('h1', publisher + '’s Common Form Projects'),
        state.about ? about(state.about) : null,
        list(publisher, state.projects, send),
        h('a.nav', {href: '/publishers'},
          '« list of all publishers'
        )
      ])
    ])
  }
}

function about (text) {
  return h('p.about', text)
}

function list (publisher, projects, send) {
  if (projects.length === 0) {
    return h('p', 'No publications')
  } else {
    return h('ul',
      projects.map(function (project) {
        return projectItem(
          publisher,
          project.name,
          project.editions,
          send
        )
      })
    )
  }
}

function projectItem (publisher, project, editions, send) {
  return h('li', [
    project + ':',
    h('ul.editions',
      editions
        .sort(compare)
        .map(function (edition) {
          return h('li',
            editionLink(publisher, project, edition, send)
          )
        })
    )
  ])
}

function editionLink (publisher, project, edition, send) {
  var href = (
    '/publications' +
    '/' + encodeURIComponent(publisher) +
    '/' + encodeURIComponent(project) +
    '/' + encodeURIComponent(edition)
  )
  return h('a.publication', {href: href}, edition)
}
