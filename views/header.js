var assert = require('assert')
var digestLink = require('./digest-link')
var spell = require('reviewers-edition-spell')

var NOT_DEFINED = /^The term "([^"]+)" is used, but not defined\.$/

module.exports = function header (
  digest, publications, annotationsList, toDigest, toPublications, send
) {
  assert(typeof digest === 'string')
  assert(Array.isArray(publications))
  assert(Array.isArray(annotationsList))
  assert(send !== undefined)
  var header = document.createElement('header')
  header.appendChild(paragraph(digest, publications, send))
  if (toDigest) {
    var p = document.createElement('p')
    p.appendChild(document.createTextNode('compared to'))
    header.appendChild(p)
    header.appendChild(paragraph(toDigest, toPublications, send))
  }
  console.log(annotationsList)
  var notDefined = annotationsList.filter(function (annotation) {
    return NOT_DEFINED.test(annotation.message)
  })
  if (notDefined.length !== 0) {
    header.appendChild(freeTerms(notDefined.map(function (annotation) {
      return NOT_DEFINED.exec(annotation.message)[1]
    })))
  }
  return header
}

function freeTerms (terms) {
  assert(Array.isArray(terms))
  assert(terms.every(function (element) {
    return typeof element === 'string'
  }))
  var p = document.createElement('p')
  p.classNames = 'freeTerms'
  p.appendChild(document.createTextNode('Not Defined: '))
  terms.forEach(function (term, index) {
    var a = document.createElement('a')
    a.classNames = 'use'
    a.appendChild(document.createTextNode(term))
    p.appendChild(a)
    if (index !== terms.length - 1) {
      p.appendChild(document.createTextNode(', '))
    }
  })
  return p
}

function paragraph (digest, publications, send) {
  assert(typeof digest === 'string')
  assert(Array.isArray(publications))
  assert(send !== undefined)
  var div = document.createElement('div')
  var p = document.createElement('p')
  p.appendChild(digestLink(digest))
  div.appendChild(p)
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
  strong.appendChild(document.createTextNode(project + ' '))

  var abbr = document.createElement('abbr')
  abbr.title = spell(edition)
  abbr.appendChild(document.createTextNode(edition))
  strong.appendChild(abbr)

  p.appendChild(strong)

  return p
}
