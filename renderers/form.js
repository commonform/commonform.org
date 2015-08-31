var annotations = require('./annotations')
var find = require('array-find')
var get = require('keyarray-get')
var h = require('virtual-dom/h')
var heading = require('./heading')
var pathID = require('../path-id')
var pick = require('object-pick')
var predicates = require('commonform-predicate')

var renderers = [
  { predicate: predicates.text,
    render: require('./text') },
  { predicate: predicates.blank,
    render: require('./blank') },
  { predicate: predicates.definition,
    render: require('./definition') },
  { predicate: predicates.reference,
    render: require('./reference') },
  { predicate: predicates.use,
    render: require('./use') } ]

function renderForm(state) {
  var root = state.path.length === 0
  var form = ( root ? state.data : state.data.form )
  var annotationsHere = get(state.annotationsTree, [ 'form', 'annotations' ])
  var hasHeading = ( !root && ( 'heading' in state.data ) )
  return h('section',
    { className: (
      'conspicuous' in form ?
        'form conspicuous' : undefined ),
      id: pathID(state.digest, state.path) },
    [ ( hasHeading ?
          heading({
            digest: state.digest,
            depth: ( state.path.length / 2 ),
            emit: state.emit,
            data: state.data.heading}) :
          null ),
      form.content
        .map(function(child, index) {
          var childPath = state.path
            .concat([ 'content', index ])
          if (predicates.child(child)) {
            var childState = pick(state, [ 'digest', 'emit' ])
            childState.merkle = state.merkle.content[index]
            childState.data = child
            childState.path = childPath
            var annotationsKey = (
              root ?
                [ 'content', index ] :
                [ 'form', 'content', index ] )
            childState.annotationsTree = (
              get(state.annotationsTree, annotationsKey) ||
              { } )
            return renderForm(childState) }
          else {
            return find(renderers, function(renderer) {
              return renderer.predicate(child) })
            .render({
                annotations: state.annotations,
                data: child,
                digest: state.digest,
                emit: state.emit,
                path: state.path.concat(childPath) }) } }),
      ( annotationsHere ?
          annotations(annotationsHere) :
          null ) ]) }

module.exports = renderForm
