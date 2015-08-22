require('tape')('Load', function(test) {
  test.plan(2)
  require('./driver')()
    .getText('a.about')
    .then(function(value) {
      test.equal(
        value, 'About Common Form',
        'a.about says "About Common Form"') })
    .getText('a.openSource')
    .then(function(value) {
      test.equal(
        value, 'Common Form is open-source software.',
        'a.openSource says "Common Form is open-source software."') })
    .end() })
