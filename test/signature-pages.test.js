var merkleize = require('commonform-merkleize')
var postForm = require('./post-form')
var tape = require('tape')
var webdriver = require('./webdriver')

var form = {
  content: ['This is a test.']
}

var digest = merkleize(form).digest

var testURL = 'http://localhost:8000/forms/' + digest

tape.test('Signature Pages', function (test) {
  var addButton = '//button[contains(text(),"Add Signature Page")]'
  var deleteButton = (
    '//button[' +
    'contains(text(),"Delete this Signature Page")' +
    ']'
  )
  var pageFollows = '//*[contains(text(),"Signature Page Follows")]'
  var pagesFollow = '//*[contains(text(),"Signature Pages Follow")]'

  test.test(function (test) {
    test.plan(2)
    postForm(form, function (error) {
      test.ifError(error, 'no error')
      webdriver
      .url(testURL)
      .waitForExist(addButton)
      .click(addButton)
      .isExisting(pageFollows)
      .then(function (existing) {
        test.assert(
          existing,
          'On clicking "Add Signature Page", ' +
          'the text "Signature Page Follows" appears.'
        )
      })
    })
  })

  test.test(function (test) {
    test.plan(2)
    postForm(form, function (error) {
      test.ifError(error, 'no error')
      webdriver
      .url(testURL)
      .waitForExist(addButton)
      .click(addButton)
      .click(addButton)
      .isExisting(pagesFollow)
      .then(function (existing) {
        test.assert(
          existing,
          'On clicking "Add Signature Page" twice, ' +
          'the text "Signature Pages Follow" appears.'
        )
      })
    })
  })

  test.test(function (test) {
    test.plan(2)
    postForm(form, function (error) {
      test.ifError(error, 'no error')
      webdriver
      .url(testURL)
      .waitForExist(addButton)
      .click(addButton)
      .waitForExist(deleteButton)
      .click(deleteButton)
      .isExisting(pageFollows)
      .then(function (existing) {
        test.assert(
          !existing,
          'On clicking "Add Signature Page" ' +
          'and then "Delete this Signature Page", ' +
          'the text "Signature Page Follows" disappears.'
        )
      })
    })
  })
})
