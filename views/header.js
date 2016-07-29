const html = require('choo/html')
const digestLink = require('./digest-link')
const spell = require('reviewers-edition-spell')

module.exports = function (digest, publications, toDigest, toPublications) {
  return toDigest
  ? html`
    <header>
      ${paragraph(digest, publications)}
      <p>compared to</p>
      ${paragraph(toDigest, toPublications)}
    </header>
  `
  : paragraph(digest, publications)
}

function paragraph (digest, publications) {
  return html`
    <div>
      <p>${digestLink(digest)}</p>
      ${publicationsList(publications)}
    </div>
  `
}

function publicationsList (publications) {
  return html`<p>${publications.map(publicationLine)}</p>`
}

function publicationLine (publication) {
  var edition = publication.edition
  var project = publication.project
  var publisher = publication.publisher
  var link = `/publications/${publisher}/${project}/${edition}`
  if (publication.root) {
    return html`
      <p class=publication>
        <strong>${publisher}</strong>
        published this form as
        <strong>
          ${project}
          <abbr title=${spell(edition)}>${edition}</abbr>
        </strong>
      </p>
    `
  } else {
    return html`
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
