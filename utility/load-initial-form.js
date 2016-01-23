module.exports = loadInitialForm

var downloadForm = require('./download-form')
var isSHA256 = require('is-sha-256-hex-digest')
var merkleize = require('commonform-merkleize')
var welcome = require('commonform-welcome-form')
var querystring = require('querystring')

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
      downloadForm(initialDigest, function(error, baseResponse) {
        if (error) {
          alert(error.message) }
        else {
          var query = querystring.parse(window.location.search.slice(1))
          var comparing = query.comparing
          if (comparing) {
            downloadForm(comparing, function(error, comparingResponse) {
              if (error) {
                alert(error.message) }
              else {
                load(baseResponse, comparingResponse) } }) }
          else {
            load(baseResponse) } } }) } }
  else {
    load(welcome) } }
