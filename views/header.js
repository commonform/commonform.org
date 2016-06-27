const choo = require('choo')
const digestLink = require('./digest-link')
const spell = require('reviewers-edition-spell')

module.exports = function (digest, publications, toDigest, toPublications) {
  return toDigest
    ? choo.view`
      <header>
        ${paragraph(digest, publications)}
        <p>compared to</p>
        ${paragraph(toDigest, toPublications)}
      </header>
    `
    : paragraph(digest, publications)
}

function paragraph (digest, publications) {
  return choo.view`
    <div>
      <p>${digestLink(digest)}</p>
      ${publicationsList(publications)}
    </div>
  `
}

function publicationsList (publications) {
  return choo.view`<p>${publications.map(publicationLine)}</p>`
}

function publicationLine (publication) {
  return choo.view`
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
