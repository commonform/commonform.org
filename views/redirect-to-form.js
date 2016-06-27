module.exports = function redirectToForm (params, state, send) {
  send('form:redirectToForm', params)
  return choo.view`
    <div class=container>
      <article class=commonform>
        Loading...
      </article>
    </div>
  `
}

