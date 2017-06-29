var assert = require('assert')
var collapsed = require('../html/collapsed')
var digestLink = require('./digest-link')
var literal = require('../html/literal')
var spell = require('reviewers-edition-spell')

module.exports = function header (
  digest, publications, toDigest, toPublications, send
) {
  assert(typeof digest === 'string')
  assert(Array.isArray(publications))
  assert(send !== undefined)
  return toDigest
    ? collapsed`
      <header>
        ${paragraph(digest, publications, send)}
        <p>compared to</p>
        ${paragraph(toDigest, toPublications, send)}
      </header>
    `
    : collapsed`
      <header>
      ${paragraph(digest, publications, send)}
      </header>
    `
}

function paragraph (digest, publications, send) {
  assert(typeof digest === 'string')
  assert(Array.isArray(publications))
  assert(send !== undefined)
  return collapsed`
    <div>
      <p>${digestLink(digest)}</p>
      ${publicationsList(publications)}
    </div>
  `
}

function publicationsList (publications) {
  return collapsed`<p>${publications.map(publicationLine)}</p>`
}

function publicationLine (publication) {
  var edition = publication.edition
  var project = publication.project
  var publisher = publication.publisher
  var link = `/publications/${publisher}/${project}/${edition}`
  if (publication.root) {
    return literal`
      <p class=publication>
        <a
            class=publisher
            href="/publishers/${encodeURIComponent(publisher)}"
          >${publisher}</a>
        published this form as
        <strong>
          ${project}
          <abbr title=${spell(edition)}>${edition}</abbr>
        </strong>
      </p>
    `
  } else {
    return literal`
      <p class=publication>
        <strong>${publisher}</strong>
        published this form within
        <strong>
          <a
              class=publication
              href=${link}
              title="Read ${publisher}'s ${project} ${spell(edition)}">
            ${project}
            <abbr title=${spell(edition)}>${edition}</abbr>
          </a>
        </strong>
      </p>
    `
  }
}
