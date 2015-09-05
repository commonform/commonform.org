var addAboveButton = require('./add-above-button')
var addBelowButton = require('./add-below-button')
var addFormWithinButton = require('./add-form-within-button')
var addHeadingButton = require('./add-heading-button')
var addParagraphWithinButton = require('./add-paragraph-within-button')
var deleteButton = require('./delete-button')
var deleteHeadingButton = require('./delete-heading-button')
var digest = require('./digest')
var h = require('virtual-dom/h')
var shareButton = require('./share-button')

function menu(state) {
  return h('div.menu',
    [ digest({ digest: state.merkle.digest }),
      h('.buttons', [
        shareButton({ form: state.data.form }), ' ',
        deleteButton(state), ' ',
        ( state.data.hasOwnProperty('heading') ?
          deleteHeadingButton(state) :
          addHeadingButton(state) ), ' ',
        addAboveButton(state), ' ',
        addBelowButton(state), ' ',
        addParagraphWithinButton(state), ' ',
        addFormWithinButton(state) ]) ]) }

module.exports = menu
