module.exports = signatureEntity

var h = require('virtual-dom/h')
var input = require('./replaceable-input')

function signatureEntity(state) {
  var emit = state.emit
  var entity = state.entity
  var needsBy = state.needsBy
  var path = state.path

  function updateValue(key, value) {
    var keyPath = path.concat(key)
    if (value.length > 0) {
      emit('signatures', 'set', keyPath, value) }
    else {
      emit('signatures', 'delete', keyPath) } }

  function inputFor(key, placeholder) {
    return input(
      ( entity[key] || '' ),
      function(value) {
        updateValue(key, value) },
      function() {
        updateValue(key, '') },
      placeholder) }

  return h('p.entity',
    [ ( needsBy ? 'By: ' : null ),
      inputFor('name', 'Name'), ', a ',
      inputFor('jurisdiction', 'Jurisdiction'), ' ',
      inputFor('form', 'Entity Type'),
      ( needsBy ?
          [ ', its ',
            (function() {
              var by = state.by
              var byPath = state.byPath
              return input(
                by,
                function(value) {
                  emit('signatures', 'set', byPath, value) },
                function() {
                  emit('signatures', 'delete', byPath) },
                'Role') })() ] :
          null ),
      h('p',
        h('button',
          { onclick: function(event) {
              event.preventDefault()
              emit('signatures', 'splice', path) } },
          'Delete Entity')) ]) }
