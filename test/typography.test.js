var tape = require('tape')
var webdriver = require('./webdriver')

tape('Typography', function (suite) {
  suite.test(function (test) {
    test.plan(1)
    var hash = (
      'd68564fa22da73d2bb989207d4973ec7' +
      '366da62b612f63f65eaa8e2a2281222d'
    )
    webdriver
    .url('http://localhost:8000/forms/' + hash)
    .isExisting('//*[contains(text(),"Wouldn’t")]')
    .then(function (existing) {
      test.assert(
        existing,
        'Displays "Wouldn’t" with nice quote.'
      )
    })
  })

  suite.test(function (test) {
    test.plan(1)
    var hash = (
      'd68564fa22da73d2bb989207d4973ec7' +
      '366da62b612f63f65eaa8e2a2281222d'
    )
    webdriver
    .url('http://localhost:8000/forms/' + hash)
    .isExisting('//*[contains(text(),"“quotation marks”")]')
    .then(function (existing) {
      test.assert(
        existing,
        'Displays “quotation marks” with nice quotes.'
      )
    })
  })
})
