var tape = require('tape')
var webdriver = require('./webdriver')

var TEST = (
  '7e1da4b2412325c4aabc87a235b993e2' +
  'e1c4e0c6a8e616d7965c6a126cdbdcfc'
)
var testURL = 'http://localhost:8000/forms/' + TEST

tape('Edits', function (suite) {
  suite.test('change heading', function (test) {
    test.plan(1)
    var firstHeading = '(//input[@class="heading"])[1]'
    var newRoot = (
      'f7287d02fb9d25b8de9db61f3c065c96' +
      '59a87fac298dc2e7c6ee484b18814f22'
    )
    webdriver
    .url(testURL)
    .waitForExist(firstHeading)
    // Change to edit mode.
    .click('//a[contains(@class, "edit")]')
    // Select the only heading.
    .click(firstHeading)
    // Backspace the current heading.
    .keys('\uE003'.repeat(20))
    // Type a new one.
    .keys('Edited Heading')
    // Hit Enter.
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
