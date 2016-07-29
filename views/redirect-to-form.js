var html = require('choo/html')

module.exports = function redirectToForm (state, prev, send) {
  var params = state.params
  send('form:redirectToForm', params)
  return html`
    <div class=container>
      <article class=commonform>
        Loading...
      </article>
    </div>
  `
}
