require('tape')('Sanity Check', function(test) {
  test.plan(1)
  require('./webdriver')()
    .getText('a.openSource')
    .then(function(value) {
      test.equal(
      value,
      'Common Form is open-source software.',
      'a.openSource says "Common Form is open-source software."') })
    .end() })
