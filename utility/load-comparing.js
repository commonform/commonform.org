module.exports = loadComparing

var downloadForm = require('commonform-get-form')

var COMPARE_HASH = /^#compare:([a-f0-9]{64})$/
//       Groups:             1

function loadComparing(hash, load) {
  var match
  if (( match = COMPARE_HASH.exec(hash) )) {
    var digest = match[1]
    downloadForm(digest, function(error, form) {
      if (error) {
        alert(error.message) }
      else {
        load({ digest: digest, form: form }) } }) } }
