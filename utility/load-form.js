module.exports = loadForm

var downloadForm = require('commonform-get-form')
var getFormPublications = require('commonform-get-form-publications')

function loadForm(digest, callback) {
  var errored = false
  var form
  var publications
  function done() {
    if (!errored && form && publications) {
      callback(null, form, publications) } }
  downloadForm(digest, function(error, formData) {
    if (error) {
      errored = true
      callback(error) }
    else { form = formData } })
  getFormPublications(digest, function(error, publicationsData) {
    if (!error) { publications = publicationsData }
    done() }) }
