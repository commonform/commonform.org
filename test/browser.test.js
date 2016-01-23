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
    var addButton =    '//button[contains(text(),"Add Signature Page")]'
    var deleteButton = '//button[contains(text(),"Delete this Signature Page")]'
    var pageFollows = '//*[contains(text(),"Signature Page Follows")]'
    var pagesFollow = '//*[contains(text(),"Signature Pages Follow")]'

    test.test(function(test) {
      test.plan(1)
      webdriver
        .url('http://localhost:8000')
        .waitForExist(addButton)
        .click(addButton)
        .isExisting(pageFollows)
        .then(function(existing) {
          test.assert(
            existing,
            'On clicking "Add Signature Page", ' +
            'the text "Signature Page Follows" appears.') }) })

    test.test(function(test) {
      test.plan(1)
      webdriver
        .url('http://localhost:8000')
        .waitForExist(addButton)
        .click(addButton)
        .click(addButton)
        .isExisting(pagesFollow)
        .then(function(existing) {
          test.assert(
            existing,
            'On clicking "Add Signature Page" twice, ' +
            'the text "Signature Pages Follow" appears.') }) })

    test.test(function(test) {
      test.plan(1)
      webdriver
        .url('http://localhost:8000')
        .waitForExist(addButton)
        .click(addButton)
        .waitForExist(deleteButton)
        .click(deleteButton)
        .isExisting(pageFollows)
        .then(function(existing) {
          test.assert(
            !existing,
            'On clicking "Add Signature Page" ' +
            'and then "Delete this Signature Page", '+
            'the text "Signature Page Follows" disappears.') }) })

    test.test(function(test) {
      test.plan(1)
      var base = (
        '527d5af64284a8edd1bda8b7dbf667ef' +
        '4f2a2eb27fbf36360825a024f6d7a1f7' )
      var comparing = (
        '93e53edf35669414835c7b8f677dcd4d' +
        'ee7893cac345ca57f56f2e98be496c49' )
      webdriver
        .url('http://localhost:8000/forms/' + base + '?comparing=' + comparing)
        .isExisting('//ins[contains(text(),"in cash")]')
        .then(function(existing) {
          test.assert(
            !existing,
            'Comparing ' +
            '527d... and 93e5...' +
            'shows "in cash" inserted.') }) })

    test.test(function(test) {
      test.plan(1)
      var base = (
        'ac2cefd3a769f3495ec998e9845147be' +
        '5d3dfd7357a1b7e4be9f8da3af094dcf' )
      var comparing = (
        '527d5af64284a8edd1bda8b7dbf667ef' +
        '4f2a2eb27fbf36360825a024f6d7a1f7' )
      webdriver
        .url('http://localhost:8000/forms/' + base + '?comparing=' + comparing)
        .isExisting('//ins[contains(text(),"in cash")]')
        .then(function(existing) {
          test.assert(
            !existing,
            'Comparing ' +
            '527d... and 93e5...' +
            'shows "in cash" inserted.') }) })
  }) })

tape.onFinish(function() {
  webdriver.end() })
