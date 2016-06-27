var tape = require('tape')
var webdriver = require('./webdriver')

tape('Loading from API', function(suite) {
  suite.test('Load from API', function(test) {
    test.plan(1)
    var digest =
      '813203e4f775c681aee09075f0990e7e79b5037fcce9440b66b4bfb436206748'
    webdriver
      .url('http://localhost:8000/forms/' + digest)
      .waitForExist('//*[contains(text(),"api.commonform.org")]')
      .isExisting('//*[contains(text(),"api.commonform.org")]')
      .then(function(existing) {
        test.assert(
          existing,
          'Page displays form from API.') }) })

  suite.test('Load from a project', function(test) {
    test.plan(1)
    webdriver
      .url('http://localhost:8000/publications/test/test')
      .waitForExist('//*[contains(text(),"This is a test form.")]', 2000)
      .isExisting('//*[contains(text(),"This is a test form.")]')
      .then(function(existing) {
        test.assert(
          existing,
          'Page displays form from API.') }) })

  suite.test('Display project name', function(test) {
    test.plan(1)
    webdriver
      .url('http://localhost:8000/publications/test/test/1e')
      .waitForExist('//*[contains(text(),"test")]', 2000)
      .isExisting('//*[contains(text(),"test")]')
      .then(function(existing) {
        test.assert(
          existing,
          'Page displays project name.') }) })

  suite.test('Display project edition', function(test) {
    test.plan(1)
    webdriver
      .url('http://localhost:8000/publications/test/test/1e')
      .waitForExist('//abbr[contains(text(), "1e")]', 2000)
      .isExisting('//abbr[contains(@title,"first edition") and contains(text(), "1e")]')
      .then(function(existing) {
        test.assert(
          existing,
          'Page displays project name.') }) })

  suite.test('Load from a project, latest edition', function(test) {
    test.plan(1)
    webdriver
      .url('http://localhost:8000/publications/test/test/latest')
      .waitForExist('//*[contains(text(),"This is a test form.")]', 2000)
      .isExisting('//*[contains(text(),"This is a test form.")]')
      .then(function(existing) {
        test.assert(
          existing,
          'Page displays form from API.') }) })

  suite.test('Load from a project, implied current edition', function(test) {
    test.plan(1)
    webdriver
      .url('http://localhost:8000/publications/test/test')
      .waitForExist('//*[contains(text(),"This is a test form.")]', 2000)
      .isExisting('//*[contains(text(),"This is a test form.")]')
      .then(function(existing) {
        test.assert(
          existing,
          'Page displays form from API.') }) })

  suite.test('Load from a project, current edition', function(test) {
    test.plan(1)
    webdriver
      .url('http://localhost:8000/publications/test/test/current')
      .waitForExist('//*[contains(text(),"This is a test form.")]', 2000)
      .isExisting('//*[contains(text(),"This is a test form.")]')
      .then(function(existing) {
        test.assert(
          existing,
          'Page displays form from API.') }) }) })
