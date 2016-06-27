const choo = require('choo')
const digestLink = require('./digest-link')
const spell = require('reviewers-edition-spell')

module.exports = function (digest, publications) {
  return choo.view`
    <header>
      <p>${digestLink(digest)}</p>
      ${publicationsList(publications)}
    </header>
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
