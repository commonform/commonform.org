Function.prototype.bind = (
  Function.prototype.bind || require('function-bind') )

var state = {
  form: {
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

var loop = require('main-loop')(
  state, require('./renderers/index'), require('virtual-dom'))

document
  .querySelector('#browser')
  .appendChild(loop.target)
