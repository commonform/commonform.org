var compare = require('reviewers-edition-compare')
var footer = require('./footer')
var html = require('choo/html')
var loading = require('./loading')
var showError = require('./error')

module.exports = function (state, previous, send) {
  var publisher = state.params.publisher
  var haveData = (
    state.browser.publisher === publisher &&
    state.browser.projects
  )
  if (!haveData) {
    return loading(function () {
      send('browser:fetch', {
        type: 'projects',
        publisher: publisher
      })
    })
  } else if (state.browser.error) {
    return showError(state.browser.error)
  } else {
    return html`
      <div class=container>
        <article class=commonform>
          <h1>${publisher}’s Common Form Projects</h1>
          <ul>
            ${
              state.browser.projects.map(function (project) {
                return projectItem(
                  publisher,
                  project.name,
                  project.editions,
                  send
                )
              })
            }
          </ul>
          <a href="/publishers" class=nav>« list of all publishers</a>
          ${footer()}
        </article>
      </div>
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
