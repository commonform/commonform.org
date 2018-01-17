var assert = require('assert')
var digestLink = require('./digest-link')
var spell = require('reviewers-edition-spell')

var NOT_DEFINED = /^The term "([^"]+)" is used, but not defined\.$/
var NOT_USED = /^The heading "([^"]+)" is referenced, but not used\.$/

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
  var notDefined = []
  var notUsed = []
  annotationsList.forEach(function (annotation) {
    var message = annotation.message
    var match
    match = NOT_DEFINED.exec(message)
    if (match) {
      notDefined.push(match[1])
      return
    }
    match = NOT_USED.exec(message)
    if (match) {
      notUsed.push(match[1])
    }
  })
  if (notDefined.length !== 0) {
    header.appendChild(freeList(notDefined.sort(), 'Needs Terms'))
  }
  if (notUsed.length !== 0) {
    header.appendChild(freeList(notUsed.sort(), 'Needs Headings'))
  }
  return header
}

function freeList (list, message) {
  assert(Array.isArray(list))
  assert(list.every(function (element) {
    return typeof element === 'string'
  }))
  var p = document.createElement('p')
  p.appendChild(document.createTextNode(message + ': '))
  list.forEach(function (element, index) {
    var span = document.createElement('span')
    span.appendChild(document.createTextNode(element))
    p.appendChild(span)
    if (index !== list.length - 1) {
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
