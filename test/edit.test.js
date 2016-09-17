var postForm = require('./post-form')
var merkleize = require('commonform-merkleize')
var tape = require('tape')
var webdriver = require('./webdriver')

var before = {
  content: [
    {
      heading: 'Original',
      form: {
        content: ['This is a test.']
      }
    }
  ]
}

var after = {
  content: [
    {
      heading: 'Edited',
      form: {
        content: ['This is a test.']
      }
    }
  ]
}

var testURL = 'http://localhost:8000/forms/' + merkleize(before).digest

tape('Edits', function (suite) {
  suite.test('change heading', function (test) {
    postForm(before, function (error) {
      test.plan(2)
      test.ifError(error)
      var firstHeading = '(//input[@class="heading"])[1]'
      webdriver
      .url(testURL)
      .waitForExist(firstHeading)
      // Select the only heading.
      .click(firstHeading)
      // Backspace the current heading.
      .keys('\uE003'.repeat(20))
      // Type a new one.
      .keys('Edited')
      // Hit Enter.
      .keys('\uE006')
      .waitForText('.digest', merkleize(after).digest)
      .getUrl()
      .then(function (url) {
        test.equal(
          url,
          'http://localhost:8000/forms/' + merkleize(after).digest,
          'updates location bar'
        )
      })
    })
  })
})
