var h = require('virtual-dom/h')
var scrollTo = require('../scroll-to')

function list(state) {
  return h('ol',
    Object.keys(state)
      .map(function(key) {
        var value = state[key]
        return h('ol', [
          ( ( 'heading' in value ) ?
              h(
                'a',
                { href: '#',
                  onclick: function(event) {
                    event.preventDefault()
                    scrollTo('digest', value.digest) } },
                value.heading) :
              undefined ),
          list(value.content) ]) })) }

function tableOfContents(state) {
  return h('nav', list(state)) }

module.exports = tableOfContents
