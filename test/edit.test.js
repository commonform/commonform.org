var tape = require('tape')
var webdriver = require('./webdriver')

tape('Edits', function (suite) {
  suite.test('change heading', function (test) {
    test.plan(1)
    var firstHeading = '(//input[@class="heading"])[1]'
    var newRoot = (
      '396a923d7d702869d0265f56874231da' +
      '218c8c9d2d8496ae2b0e54bf64ec815e'
    )
    webdriver
    .url('http://localhost:8000')
    .waitForExist(firstHeading)
    .click(firstHeading)
    .keys(' Back!')
    .keys('\uE006')
    .waitForText('.digest', newRoot)
    .getUrl()
    .then(function (url) {
      test.equal(
        url,
        'http://localhost:8000/forms/' + newRoot,
        'updates location bar'
      )
    })
  })
})
