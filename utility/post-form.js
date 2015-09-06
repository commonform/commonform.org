var xhr = require('xhr')

function postForm(form, callback) {
  xhr(
    { url: 'https://api.commonform.org/forms/',
      body: JSON.stringify(form),
      method: 'POST',
      headers: { 'Content-Type': 'application/json' } },
    function(error, response) {
      if (error) {
        callback(error) }
      else {
        callback(null, response.headers.location) } }) }

module.exports = postForm
