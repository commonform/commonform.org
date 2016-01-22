module.exports = signatureEntities

var h = require('virtual-dom/h')
var renderSignatureEntity = require('./signature-entity')

function signatureEntities(state) {
  var emit = state.emit
  var entities = ( state.entities || [ ] )
  var path = state.path
  return h('.entities',
    [ entities.map(function(entity, index, entities) {
        return renderSignatureEntity(
          { by: (
              ( index > 0 ) ?
                entities[index - 1].by :
                false ),
            byPath: path.concat(( index - 1 ), 'by'),
            entity: entity,
            emit: emit,
            needsBy: ( index > 0 ),
            path: path.concat(index) }) }),
      h('p',
        h('button',
          { onclick: function(event) {
              event.preventDefault()
              emit('signatures', 'set', path, entities.concat({ })) } },
          'Add Entity')) ]) }
