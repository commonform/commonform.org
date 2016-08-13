var tape = require('tape')
var webdriver = require('./webdriver')

var TEST = (
  '543cd5e172cfc6b3c20a0d91855fea44' +
  'b5bf2fd1da7bf6b7c69f95d6e2705c37'
)
var testURL = 'http://localhost:8000/forms/' + TEST

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
    test.plan(1)
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

  test.test(function (test) {
    test.plan(1)
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

  test.test(function (test) {
    test.plan(1)
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
