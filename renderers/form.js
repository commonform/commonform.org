var annotations = require('./annotations')
var clone = require('clone')
var group = require('commonform-group-series')
var h = require('virtual-dom/h')
var paragraph = require('./paragraph')
var pathID = require('../path-id')
var pick = require('object-pick')
var series = require('./series')

function form(state) {
  var groups = group(clone(state.data))
  var offset = 0
  return h('section',
    { className: (
      'conspicuous' in state.data ?
        'form conspicuous' : 'form' ),
      id: pathID(state.digest, state.path) },
    [ groups
        .map(function(group) {
          var renderer = ( group.type === 'series' ?
            series : paragraph )
          var groupState = pick(state,
            [ 'annotations', 'digest', 'emit', 'focused', 'path' ])
          groupState.data = group
          groupState.offset = offset
          var result = renderer(groupState)
          offset += group.content.length
          return result }),
      annotations(state) ]) }

module.exports = form
