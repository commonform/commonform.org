var merkleize = require('commonform-merkleize')
var tape = require('tape')
var webdriver = require('./webdriver')
var welcome = require('commonform-welcome-form')

var welcomeDigest = merkleize(welcome).digest

tape('Display', function(test) {
  test.test('Sanity Check', function(test) {
    test.plan(1)
    webdriver
      .getText('a.openSource')
      .then(function(value) {
        test.equal(
        value,
        'Common Form is open-source software.',
        'a.openSource says "Common Form is open-source software."') }) })

  test.test('Welcome', function(test) {
    test.plan(2)
    var digestPrefix = welcomeDigest.substr(0, 16)
    webdriver
      .url('http://localhost:8000')
      .waitForExist('.heading=Welcome')
      .isExisting('.heading=Welcome')
      .then(function(existing) {
        test.assert(
          existing,
          'Page displays "Welcome" heading.') })
      .isExisting('//*[contains(text(),\'' + digestPrefix + '\')]')
      .then(function(existing) {
        test.assert(
          existing,
          'Page displays digest of welcome form.') }) }) })
