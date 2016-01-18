module.exports = form

var classnames = require('classnames')
var group = require('commonform-group-series')
var h = require('virtual-dom/h')
var heading = require('./heading')
var jsonClone = require('../utility/json-clone')
var paragraph = require('./paragraph')
var series = require('./series')

function form(state) {
  // State
  var blanks = state.blanks
  var data = state.data
  var emit = state.emit
  var merkle = state.derived.merkle
  var path = state.path

  // Derivations
  var root = path.length === 0
  var annotationsKey = ( root ? [ ] : [ 'form' ] )
  var formObject = ( root ? data : data.form )
  var groups = group(jsonClone(formObject))

  // Rendering
  var offset = 0
  return [
    h('section',
      { className: classnames({
          conspicuous: ( 'conspicuous' in formObject ) }),
        attributes: { 'data-digest': merkle.digest } },
      [ heading({ heading: data.heading, path: path }),
        groups
          .map(function(group) {
            var groupState = {
              blanks: blanks,
              data: group,
              derived: { },
              emit: emit,
              offset: offset,
              path: path.concat(annotationsKey) }
            var renderer
            if (group.type === 'series') {
              renderer = series
              groupState.derived.merkle = merkle }
            else {
              renderer = paragraph }
            var result = renderer(groupState)
            offset += group.content.length
            return result }) ]) ] }
