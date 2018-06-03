module.exports = function longDate (date) {
  return date.toLocaleTimeString('en-US', {
    day: 'numeric',
    year: 'numeric',
    month: 'long',
    timeZone: 'UTC',
    hour12: true
  }) + ' UTC'
}
