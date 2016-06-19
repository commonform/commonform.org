module.exports = loadInitialForm

var downloadForm = require('./download-form')
var merkleize = require('commonform-merkleize')
var welcome = require('commonform-welcome-form')
var getPublication = require('commonform-get-publication')
var getFormPublications = require('commonform-get-form-publications')
var parallel = require('run-parallel')

var welcomeDigest = merkleize(welcome).digest

var FORM_PATH = /^\/forms\/([a-f0-9]{64})$/
//       Groups:           1

var PROJECT_PATH = /^\/projects\/([a-z]+)\/([a-z0-9-]+)(\/([0-9eucd]+|latest|current))?$/
//       Groups:                 1         2           3  4

function loadInitialForm(path, prefix, load) {
  var initialDigest
  var match
  if (( match = FORM_PATH.exec(path) )) {
    initialDigest = match[1]
    if (initialDigest === welcomeDigest) {
      load(welcome, false, [ ]) }
    else {
      parallel(
        [ downloadForm.bind(this, initialDigest),
          getFormPublications.bind(this, initialDigest) ],
        function(error, results) {
          if (error) {
            alert(error.message) }
          else {
            load(results[0], true, results[1]) } }) } }
  else if (( match = PROJECT_PATH.exec(path) )) {
    var publisher = match[1]
    var project = match[2]
    var edition = ( match[4] || 'current' )
    getPublication(publisher, project, edition, function(error, publication) {
      if (error) {
        alert(error.message) }
      else {
        parallel(
          [ downloadForm.bind(this, publication.digest),
            getFormPublications.bind(this, publication.digest) ],
          function(error, results) {
            if (error) {
              alert(error.message) }
            else {
              load(results[0], true, results[1]) } }) } }) }
  else {
    load(welcome, true, [ ]) } }
