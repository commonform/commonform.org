require('tape')('Child Button', function(test) {
  test.test('... toggles child menu.', function(test) {
    test.plan(2)
    require('./driver')()
      .timeoutsImplicitWait(2000)
      .waitForExist('.childButton', 10000)
      .isVisible('.delete')
      .then(function(isVisible) {
        test.assert(isVisible, 'delete button starts visible') })
      .click('.childButton')
      .isVisible('.delete', 10000)
      .then(function(isVisible) {
        test.assert(!isVisible, 'child button hides delete button') })
      .end() })
  test.end() })
