var find = require('array-find')
var h = require('virtual-dom/h')
var predicates = require('commonform-predicate')

var renderers = [
  { predicate: predicates.form,
    renderer: require('./form') },
  { predicate: predicates.child,
    renderer: require('./child') },
  { predicate: predicates.blank,
    renderer: require('./blank') },
  { predicate: predicates.definition,
    renderer: require('./definition') },
  { predicate: predicates.reference,
    renderer: require('./reference') },
  { predicate: predicates.use,
    renderer: require('./use') } ]

var annotations = require('./annotations')

function form(state) {
  return h('div',
   { className: (
     'conspicuous' in state.data ?
       'form conspicuous' : 'form' ) },
   [ annotations(state),
     state.data.content
       .map(function(child, index) {
         if (predicates.text(child)) {
           return h('span', child) }
         else {
           var renderer = find(renderers, function(renderer) {
             return renderer.predicate(child) })
           if (renderer) {
             return renderer.renderer({
               path: state.path.concat([ 'content', index ]),
               emit: state.emit,
               annotations: state.annotations,
               data: child }) } } }) ]) }

module.exports = form
