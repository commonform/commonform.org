var h = require('virtual-dom/h')

function list(state) {
  return h('ol',
    Object.keys(state)
      .map(function(key) {
        var value = state[key]
        return h('li', [
            h(
              'a',
              { href: '#',
                onclick: function(event) {
                  event.preventDefault()
                  event.stopPropagation()
                  scrollTo('digest', value.digest) } },
              ( ( 'heading' in value ) ?
                  value.heading :
                  '(No heading)' )),
          list(value.content) ]) })) }

function tableOfContents(state) {
  return h('nav', list(state)) }

module.exports = tableOfContents
