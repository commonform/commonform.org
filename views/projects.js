var assert = require('assert')
var compare = require('reviewers-edition-compare')
var footer = require('./footer')
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
    var div = document.createElement('div')
    div.className = 'container'
    var article = document.createElement('article')
    article.className = 'commonform'
    article.appendChild(sidebar('browse', send))
    var h1 = document.createElement('h1')
    h1.appendChild(document.createTextNode(
      publisher + '’s Common Form Projects'
    ))
    article.appendChild(h1)
    if (state.about) {
      article.appendChild(about(state.about))
    }
    article.appendChild(list(publisher, state.projects, send))
    var a = document.createElement('a')
    a.className = 'nav'
    a.href = '/publishers'
    a.appendChild(document.createTextNode('« list of all publishers'))
    article.appendChild(a)
    article.appendChild(footer())
    div.appendChild(article)
    return div
  }
}

function about (text) {
  var p = document.createElement('p')
  p.className = 'about'
  p.appendChild(document.createTextNode(text))
  return p
}

function list (publisher, projects, send) {
  if (projects.length === 0) {
    var p = document.createElement('p')
    p.appendChild(document.createTextNode('No publications'))
    return p
  } else {
    var ul = document.createElement('ul')
    projects.forEach(function (project) {
      ul.appendChild(projectItem(
        publisher,
        project.name,
        project.editions,
        send
      ))
    })
    return ul
  }
}

function projectItem (publisher, project, editions, send) {
  var li = document.createElement('li')
  li.appendChild(document.createTextNode(project + ':'))
  var ul = document.createElement('ul')
  ul.className = 'editions'
  editions
    .sort(compare)
    .forEach(function (edition) {
      var li = document.createElement('li')
      li.appendChild(editionLink(publisher, project, edition, send))
      ul.appendChild(li)
      return li
    })
  li.appendChild(ul)
  return li
}

function editionLink (publisher, project, edition, send) {
  var href = (
    '/publications' +
    '/' + encodeURIComponent(publisher) +
    '/' + encodeURIComponent(project) +
    '/' + encodeURIComponent(edition)
  )
  var a = document.createElement('a')
  a.classNaem = 'publication'
  a.href = href
  a.appendChild(document.createTextNode(edition))
  return a
}
