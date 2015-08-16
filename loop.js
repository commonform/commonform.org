var main = require('main-loop')
var renderer = require('./renderers')
var vdom = require('virtual-dom')

var loop
var state = {
  path: [ ],
  update: function(transform) {
    transform(state)
    loop.update(state) },
  data: {
    content: [
      'Some text ',
      { blank: 'blank placeholder' },
      { definition: 'Defined Term' },
      { use: 'Defined Term' },
      'Text Before Child',
      { heading: 'Heading',
        form: {
          conspicuous: 'yes',
          content: [ 'Conspicuous Text' ] } },
      'Text Between Children',
      { form: {
          content: [
            { reference: 'Heading' } ] } },
      'Text After Child'] } }

module.exports = loop = main(state, renderer, vdom)
