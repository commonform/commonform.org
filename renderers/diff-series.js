module.exports = diffSeries

function diffSeries(state) {
  var data = state.data
  return data.content.map(function(child) {
    return require('./diff')({ diff: child }) }) }
