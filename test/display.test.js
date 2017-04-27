var tape = require('tape')
var webdriver = require('./webdriver')

tape('Display', function (test) {
  test.test('Sanity Check', function (test) {
    test.plan(1)
    webdriver
      .url('http://localhost:8000')
      .getText('a.openSource')
      .then(function (value) {
        test.equal(
          value,
          'Common Form is open-source software.',
          'a.openSource says "Common Form is open-source software."'
        )
      })
  })
})
