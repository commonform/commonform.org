var assert = require('assert')
var digestLink = require('./digest-link')
var spell = require('reviewers-edition-spell')

module.exports = function header (
  digest, publications, toDigest, toPublications, send
) {
  assert(typeof digest === 'string')
  assert(Array.isArray(publications))
  assert(send !== undefined)
  var header = document.createElement('header')
  header.appendChild(paragraph(digest, publications, send))
  if (toDigest) {
    var p = document.createElement('p')
    p.appendChild(document.createTextNode('compared to'))
    header.appendChild(p)
    header.appendChild(paragraph(toDigest, toPublications, send))
  }
  return header
}

function paragraph (digest, publications, send) {
  assert(typeof digest === 'string')
  assert(Array.isArray(publications))
  assert(send !== undefined)
  var div = document.createElement('div')
  var p = document.createElement('p')
  p.appendChild(digestLink(digest))
  div.appendChild(publicationsList(publications))
  return div
}

function publicationsList (publications) {
  var p = document.createElement('p')
  publications.forEach(function (publication) {
    p.appendChild(publicationLine(publication))
  })
  return p
}

function publicationLine (publication) {
  var edition = publication.edition
  var project = publication.project
  var publisher = publication.publisher
  var link = `/publications/${publisher}/${project}/${edition}`
  var p = document.createElement('p')
  p.className = 'publication'

  var publisherLink = document.createElement('a')
  publisherLink.className = 'publisher'
  publisherLink.href = '/publishers/' + encodeURIComponent(publisher)
  publisherLink.appendChild(document.createTextNode(publisher))
  p.appendChild(publisherLink)

  var span = document.createElement('span')
  span.appendChild(document.createTextNode(
    ' published this form ' +
    (publication.root ? 'as' : 'within') +
    ' '
  ))
  p.appendChild(span)

  var strong = document.createElement('strong')

  var projectLink = document.createElement('a')
  projectLink.className = 'publication'
  projectLink.href = link
  projectLink.title = (
    'Read ' + publisher + '\'s ' + project + ' ' + spell(edition)
  )
  strong.appendChild(projectLink)
  strong.appendChild(document.createTextNode(project))

  var abbr = document.createElement('abbr')
  abbr.title = spell(edition)
  abbr.appendChild(document.createTextNode(edition))
  strong.appendChild(abbr)

  p.appendChild(strong)

  return p
}
