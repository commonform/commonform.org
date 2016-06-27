const merkleize = require('commonform-merkleize')
const tape = require('tape')
const webdriver = require('./webdriver')
const welcome = require('commonform-welcome-form')

const welcomeDigest = merkleize(welcome).digest

tape('Display', function (test) {
  test.test('Sanity Check', function (test) {
    test.plan(1)
    webdriver
      .getText('a.openSource')
      .then(function (value) {
        test.equal(
          value,
          'Common Form is open-source software.',
          'a.openSource says "Common Form is open-source software."'
        )
      })
  })

  test.test('Welcome', function (test) {
    test.plan(2)
    const digestPrefix = welcomeDigest.substr(0, 16)
    webdriver
      .url('http://localhost:8000')
      .waitForExist('.heading=Welcome')
      .isExisting('.heading=Welcome')
      .then(function (existing) {
        test.assert(
          existing,
          'Page displays "Welcome" heading.'
        )
      })
      .isExisting('//*[contains(text(),\'' + digestPrefix + '\')]')
      .then(function (existing) {
        test.assert(
          existing,
          'Page displays digest of welcome form.'
        )
      })
  })
})
