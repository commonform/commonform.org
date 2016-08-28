var assert = require('assert')
var compare = require('reviewers-edition-compare')
var footer = require('./footer')
var html = require('yo-yo')
var loading = require('./loading')
var sidebar = require('./sidebar')

module.exports = function (publisher, state, send) {
  assert(typeof publisher === 'string')
  assert(typeof state === 'object')
  assert(typeof send === 'function')
  var haveData = state.publisher === publisher && state.projects
  if (!haveData) {
    return loading('browse', function () {
      send('browser:get projects', publisher)
    })
  } else {
    return html`
      <div class=container>
        <article class=commonform>
          ${sidebar('browse', send)}
          <h1>${publisher}’s Common Form Projects</h1>
          ${about(state.about)}
          ${list(publisher, state.projects, send)}
          <a href="/publishers" class=nav>« list of all publishers</a>
          ${footer()}
        </article>
      </div>
    `
  }
}

function about (text) {
  return text ? html`<p class=about>${text}</p>` : null
}

function list (publisher, projects, send) {
  if (projects.length === 0) {
    return html`<p>No publications</p>`
  } else {
    return html`
      <ul>
        ${
          projects.map(function (project) {
            return projectItem(
              publisher,
              project.name,
              project.editions,
              send
            )
          })
        }
      </ul>
    `
  }
}

function projectItem (publisher, project, editions, send) {
  return html`
    <li>
      ${project}:
      ${
        editions
        .sort(compare)
        .map(function (edition) {
          return editionLink(publisher, project, edition, send)
        })
      }
    </li>
  `
}

function editionLink (publisher, project, edition, send) {
  var href = (
    '/publications' +
    '/' + encodeURIComponent(publisher) +
    '/' + encodeURIComponent(project) +
    '/' + encodeURIComponent(edition)
  )
  return html`
    <a
        class=publication
        href=${href}
      >${edition}</a>
  `
}
