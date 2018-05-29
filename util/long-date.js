module.exports = function longDate (date) {
  return date.toLocaleDateString('en-US', {
    day: 'numeric',
    year: 'numeric',
    month: 'long'
  })
}
