require('tape')('Welcome', function(test) {
  test.plan(1)
  require('./webdriver')()
    .waitForExist('.heading=Welcome')
    .isExisting('.heading=Welcome')
    .then(function(existing) {
      test.assert(
        existing,
        'Page displays "Welcome" heading.') })
    .end() })
