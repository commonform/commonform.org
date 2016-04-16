module.exports = downloadForm

var parse = require('json-parse-errback')
var xhr = require('xhr')

var api = require('./constants').api

function downloadForm(digest, callback) {
  xhr(
    { url: ( api + '/forms/' + digest ) },
    function(error, response, body) {
      if (error) {
        callback(error) }
      else {
        parse(body, callback) } }) }
