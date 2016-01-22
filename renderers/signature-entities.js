module.exports = signatureEntities

var h = require('virtual-dom/h')
var renderSignatureEntity = require('./signature-entity')

function signatureEntities(state) {
  var entities = state.entities
  var emit = state.emit
  var path = state.path
  return h('.entities',
    entities.map(function(entity, index, entities) {
      return renderSignatureEntity(
        { entity: entity,
          emit: emit,
          needsBy: ( index > 0 ),
          path: path.concat('entities', index),
          byPath: path.concat('entities', ( index - 1 ), 'by'),
          by: (
            ( index > 0 ) ?
              entities[index - 1].by :
              false ) }) })) }
