var merkleize = require('commonform-merkleize')
var postForm = require('./post-form')
var postProject = require('./post-project')
var tape = require('tape')
var webdriver = require('./webdriver')

var form = {
  content: ['This is a test form.']
}

var digest = merkleize(form).digest

tape('Loading from API', function (suite) {
  suite.test('Load from API', function (test) {
    test.plan(2)
    postForm(form, function (error) {
      test.ifError(error, 'no error')
      webdriver
        .url('http://localhost:8000/forms/' + digest)
        .waitForExist(
          '//*[contains(text(),"This is a test form.")]',
          2000
        )
        .isExisting('//*[contains(text(),"This is a test form.")]')
        .then(function (existing) {
          test.assert(
            existing,
            'Page displays form from API.'
          )
        })
    })
  })

  suite.test('Load from a project', function (test) {
    test.plan(2)
    postProject('test', 'test', '1e', form, function (error) {
      test.ifError(error, 'no error')
      webdriver
        .url('http://localhost:8000/publications/test/test')
        .waitForExist(
          '//*[contains(text(),"This is a test form.")]',
          2000
        )
        .isExisting('//*[contains(text(),"This is a test form.")]')
        .then(function (existing) {
          test.assert(
            existing,
            'Page displays form from API.'
          )
        })
    })
  })

  suite.test('Display project name', function (test) {
    test.plan(2)
    postProject('test', 'test', '1e', form, function (error) {
      test.ifError(error, 'no error')
      webdriver
        .url('http://localhost:8000/publications/test/test/1e')
        .waitForExist('//*[contains(text(),"test")]', 2000)
        .isExisting('//*[contains(text(),"test")]')
        .then(function (existing) {
          test.assert(
            existing,
            'Page displays project name.'
          )
        })
    })
  })

  suite.test('Display project edition', function (test) {
    test.plan(2)
    postProject('test', 'test', '1e', form, function (error) {
      test.ifError(error, 'no error')
      webdriver
        .url('http://localhost:8000/publications/test/test/1e')
        .waitForExist('//abbr[contains(text(), "1e")]', 2000)
        .isExisting(
          '//abbr[' +
          'contains(@title,"first edition") and ' +
          'contains(text(), "1e")' +
          ']'
        )
        .then(function (existing) {
          test.assert(
            existing,
            'Page displays project name.'
          )
        })
    })
  })

  suite.test('Load from a project, latest edition', function (test) {
    test.plan(2)
    postProject('test', 'test', '1e', form, function (error) {
      test.ifError(error, 'no error')
      webdriver
        .url('http://localhost:8000/publications/test/test/latest')
        .waitForExist(
          '//*[contains(text(),"This is a test form.")]', 2000
        )
        .isExisting('//*[contains(text(),"This is a test form.")]')
        .then(function (existing) {
          test.assert(
            existing,
            'Page displays form from API.'
          )
        })
    })
  })

  suite.test('Load from a project, no edition', function (test) {
    test.plan(2)
    postProject('test', 'test', '1e', form, function (error) {
      test.ifError(error, 'no error')
      webdriver
        .url('http://localhost:8000/publications/test/test')
        .waitForExist(
          '//*[contains(text(),"This is a test form.")]', 2000
        )
        .isExisting('//*[contains(text(),"This is a test form.")]')
        .then(function (existing) {
          test.assert(
            existing,
            'Page displays form from API.'
          )
        })
    })
  })

  suite.test('Load from a project, current edition', function (test) {
    test.plan(2)
    postProject('test', 'test', '1e', form, function (error) {
      test.ifError(error, 'no error')
      webdriver
        .url('http://localhost:8000/publications/test/test/current')
        .waitForExist(
          '//*[contains(text(),"This is a test form.")]', 2000
        )
        .isExisting('//*[contains(text(),"This is a test form.")]')
        .then(function (existing) {
          test.assert(
            existing,
            'Page displays form from API.'
          )
        })
    })
  })
})
