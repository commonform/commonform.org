var merkleize = require('commonform-merkleize')
var postForm = require('./post-form')
var tape = require('tape')
var webdriver = require('./webdriver')

tape('Typography', function (suite) {
  suite.test(function (test) {
    var form = {
      content: ['Wouldn\'t look good.']
    }
    var digest = merkleize(form).digest
    test.plan(2)
    postForm(form, function (error) {
      test.ifError(error, 'no error')
      webdriver
      .url('http://localhost:8000/forms/' + digest)
      .isExisting('//*[contains(text(),"Wouldn’t")]')
      .then(function (existing) {
        test.assert(
          existing,
          'Displays "Wouldn’t" with nice quote.'
        )
      })
    })
  })

  suite.test(function (test) {
    var form = {
      content: ['Has "quotation marks"']
    }
    var digest = merkleize(form).digest
    test.plan(2)
    postForm(form, function (error) {
      test.ifError(error, 'no error')
      webdriver
      .url('http://localhost:8000/forms/' + digest)
      .isExisting('//*[contains(text(),"“quotation marks”")]')
      .then(function (existing) {
        test.assert(
          existing,
          'Displays “quotation marks” with nice quotes.'
        )
      })
    })
  })
})
