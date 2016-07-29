const tape = require('tape')
const webdriver = require('./webdriver')

tape.test('Signature Pages', function (test) {
  const addButton = '//button[contains(text(),"Add Signature Page")]'
  const deleteButton = (
    '//button[' +
    'contains(text(),"Delete this Signature Page")' +
    ']'
  )
  const pageFollows = '//*[contains(text(),"Signature Page Follows")]'
  const pagesFollow = '//*[contains(text(),"Signature Pages Follow")]'

  test.test(function (test) {
    test.plan(1)
    webdriver
    .url('http://localhost:8000')
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
    .url('http://localhost:8000')
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
    .url('http://localhost:8000')
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
