var isLocked = require('../../util/is-locked')
var html = require('../html')

module.exports = function (form) {
  if (isLocked(form)) {
    return html`
      <aside class=hint>
        <p>
          This form is <em>locked</em>.
          Links to this page will always show exactly the same terms.
        </p>
      </aside>
    `
  } else {
    return html`
      <aside class=hint>
        <p>
          This form is <em>unlocked</em>.
          Components of this form may change over time,
          as their authors improve them.
        </p>
        <p>Components are marked with ⚙ below.</p>
      </aside>
    `
  }
}
