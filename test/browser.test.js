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

  test.test('Load from a project', function(test) {
    test.plan(1)
    webdriver
      .url('http://localhost:8000/projects/test/test-form')
      .waitForExist('//*[contains(text(),"This is a test form.")]', 2000)
      .isExisting('//*[contains(text(),"This is a test form.")]')
      .then(function(existing) {
        test.assert(
          existing,
          'Page displays form from API.') }) })

  test.test('Display project name', function(test) {
    test.plan(1)
    webdriver
      .url('http://localhost:8000/projects/test/test-form/1e')
      .waitForExist('//*[contains(text(),"test")]', 2000)
      .isExisting('//*[contains(text(),"test")]')
      .then(function(existing) {
        test.assert(
          existing,
          'Page displays project name.') }) })

  test.test('Display project edition', function(test) {
    test.plan(1)
    webdriver
      .url('http://localhost:8000/projects/test/test-form/1e')
      .waitForExist('//abbr[contains(text(), "1e")]', 2000)
      .isExisting('//abbr[contains(@title,"first edition") and contains(text(), "1e")]')
      .then(function(existing) {
        test.assert(
          existing,
          'Page displays project name.') }) })

  test.test('Load from a project, latest edition', function(test) {
    test.plan(1)
    webdriver
      .url('http://localhost:8000/projects/test/test-form/latest')
      .waitForExist('//*[contains(text(),"This is a test form.")]', 2000)
      .isExisting('//*[contains(text(),"This is a test form.")]')
      .then(function(existing) {
        test.assert(
          existing,
          'Page displays form from API.') }) })

  test.test('Load from a project, implied current edition', function(test) {
    test.plan(1)
    webdriver
      .url('http://localhost:8000/projects/test/test')
      .waitForExist('//*[contains(text(),"This is a test form.")]', 2000)
      .isExisting('//*[contains(text(),"This is a test form.")]')
      .then(function(existing) {
        test.assert(
          existing,
          'Page displays form from API.') }) })

  test.test('Load from a project, current edition', function(test) {
    test.plan(1)
    webdriver
      .url('http://localhost:8000/projects/test/test/current')
      .waitForExist('//*[contains(text(),"This is a test form.")]', 2000)
      .isExisting('//*[contains(text(),"This is a test form.")]')
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
            'the text "Signature Page Follows" disappears.') }) }) })

    test.test(function(test) {
      test.plan(1)
      var hash = (
        'd68564fa22da73d2bb989207d4973ec7' +
        '366da62b612f63f65eaa8e2a2281222d' )
      webdriver
        .url('http://localhost:8000/forms/' + hash)
        .isExisting('//*[contains(text(),"Wouldn’t")]')
        .then(function(existing) {
          test.assert(
            existing,
            'Displays "Wouldn’t" with nice quote.') }) })

    test.test(function(test) {
      test.plan(1)
      var hash = (
        'd68564fa22da73d2bb989207d4973ec7' +
        '366da62b612f63f65eaa8e2a2281222d' )
      webdriver
        .url('http://localhost:8000/forms/' + hash)
        .isExisting('//*[contains(text(),"“quotation marks”")]')
        .then(function(existing) {
          test.assert(
            existing,
            'Displays “quotation marks” with nice quotes.') }) })

    var apache2 = (
      '5d912ab4e9be029a2b3d137aefeb918a' +
      'd1f001463e0f554ca24008dc70494eb0' )

    var apache2edit = (
      'dad34e74228090369e96aae72b874206' +
      '39c93de9e544dbc920a03832a0754f9c' )

    test.test(function(test) {
      test.plan(1)
      webdriver
        .url(
          'http://localhost:8000/forms/' + apache2 +
          '#compare:' + apache2edit)
        .isExisting('//*[contains(text(),"compared to")]')
        .then(function(existing) {
          test.assert(
            existing,
            'Displays "compared to" when diffing.') }) })

    test.test(function(test) {
      test.plan(1)
      webdriver
        .url(
          'http://localhost:8000/forms/' + apache2 +
          '#compare:' + apache2edit)
        .isExisting('//del/span[contains(text(),"whether")]')
        .then(function(existing) {
          test.assert(
            existing,
            'Displays "whether" as a deletion.') }) }) })

tape.onFinish(function() {
  webdriver.end() })
