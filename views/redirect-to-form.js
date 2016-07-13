const html = require('choo/html')

module.exports = function redirectToForm (state, prev, send) {
  const params = state.params
  send('form:redirectToForm', params)
  return html`
    <div class=container>
      <article class=commonform>
        Loading...
      </article>
    </div>
  `
}
