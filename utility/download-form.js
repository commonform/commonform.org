var xhr = require('xhr')

var api = require('./constants').api

function downloadForm(digest, callback) {
  xhr(
    { url: ( api + '/forms/' + digest ) },
    function(error, response, body) {
      if (error) {
        callback(error) }
      else {
        var jsonResponse
        try {
          jsonResponse = JSON.parse(body) }
        catch (e) {
          return callback(e) }
        callback(null, jsonResponse) } }) }

module.exports = downloadForm
