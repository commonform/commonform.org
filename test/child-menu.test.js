require('tape')('Child Button', function(test) {
  test.test('... toggles child menu.', function(test) {
    test.plan(2)
    require('./driver')()
      .waitForExist('.childButton')
      .click('.childButton')
      .isVisible('button.delete')
      .then(function(isVisible) {
        test.assert(isVisible, 'child button shows delete button') })
      .click('.childButton')
      .isVisible('button.delete')
      .then(function(isVisible) {
        test.assert(!isVisible, 'child button hides delete button') })
      .end() })
  test.end() })
