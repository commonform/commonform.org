var tape = require('tape')

var webdriver = require('./webdriver')()
var welcome = require('commonform-welcome-form')
var merkleize = require('commonform-merkleize')

var welcomeDigest = merkleize(welcome).digest

tape('Browser', function(test) {
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
          'Page displays digest of welcome form.') }) })

  test.test('Load from API', function(test) {
    test.plan(1)
    var digest = (
      '813203e4f775c681' +
      'aee09075f0990e7e' +
      '79b5037fcce9440b' +
      '66b4bfb436206748')
    webdriver
      .url('http://localhost:8000/forms/' + digest)
      .waitForExist('//*[contains(text(),"api.commonform.org")]')
      .isExisting('//*[contains(text(),"api.commonform.org")]')
      .then(function(existing) {
        test.assert(
          existing,
          'Page displays form from API.') }) })

  test.test('Signature Page Button', function(test) {
    test.plan(1)
    var addButton = '//button[contains(text(),"Add Signature Page")]'
    webdriver
      .url('http://localhost:8000')
      .waitForExist(addButton)
      .click(addButton)
      .isExisting('//*[contains(text(),"Signature Page Follows")]')
      .then(function(existing) {
        test.assert(
          existing,
          'Clicking "Add Signature Page" adds signature pages.') }) }) })

tape.onFinish(function() {
  webdriver.end() })
