module.exports = loadInitialForm

var downloadForm = require('./download-form')
var isSHA256 = require('is-sha-256-hex-digest')
var merkleize = require('commonform-merkleize')
var welcome = require('commonform-welcome-form')

var welcomeDigest = merkleize(welcome).digest

function loadInitialForm(path, prefix, load) {
  var prefixLength = prefix.length
  var digestLength = 64
  var initialDigest
  if (
    path && ( path.length === ( digestLength + prefixLength ) ) &&
    isSHA256(path.slice(prefixLength, ( digestLength + prefixLength ))) ) {
    initialDigest = path.slice(prefixLength, ( digestLength + prefixLength ))
    if (initialDigest === welcomeDigest) {
      load(welcome) }
    else {
      downloadForm(initialDigest, function(error, response) {
        if (error) {
          alert(error.message) }
        else {
          load(response) } }) } }
  else {
    load(welcome) } }
