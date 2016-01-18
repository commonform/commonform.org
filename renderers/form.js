module.exports = form

var classnames = require('classnames')
var deepEqual = require('deep-equal')
var group = require('commonform-group-series')
var h = require('virtual-dom/h')
var jsonClone = require('../utility/json-clone')
var renderHeading = require('./heading')
var renderParagraph = require('./paragraph')
var renderSeries = require('./series')

function form(state) {
  // State
  var blanks = state.blanks
  var form = state.form
  var emit = state.emit
  var focused = state.focused
  var merkle = state.derived.merkle
  var path = state.path

  // Derivations
  var root = path.length === 0
  var formKeyArraySuffix = ( root ? [ ] : [ 'form' ] )
  var formObject = ( root ? form : form.form )
  var groups = group(jsonClone(formObject))
  var isFocused = deepEqual(focused, path)

  // Rendering
  var offset = 0
  return [
    h('section',
      { className: classnames({
          conspicuous: ( 'conspicuous' in formObject ),
          focused: isFocused }),
        attributes: { 'data-digest': merkle.digest },
        ondblclick: function(event) {
          event.stopPropagation()
          emit('focus', path) } },
      [ renderHeading({ heading: form.heading, path: path }),
        groups
          .map(function(group) {
            var groupState = {
              blanks: blanks,
              data: group,
              derived: { },
              emit: emit,
              focused: focused,
              offset: offset,
              path: path.concat(formKeyArraySuffix) }
            var renderer
            if (group.type === 'series') {
              renderer = renderSeries
              groupState.derived.merkle = merkle }
            else {
              renderer = renderParagraph }
            var result = renderer(groupState)
            offset += group.content.length
            return result }) ]) ] }
