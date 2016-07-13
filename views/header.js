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
  return html`
    <p class=publication>
      <strong>${publication.publisher}</strong>
      published this form as
      <strong>
        ${publication.project}
        <abbr title=${spell(publication.edition)}>${publication.edition}</abbr>
      </strong>
    </p>
  `
}
