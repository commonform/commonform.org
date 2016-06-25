var tape = require('tape')

var webdriver = require('./webdriver')

tape('Edit Mode', function(test) {
  test.test('Click to move child forms.', function(test) {
    var newHash = (
      'cbdec2965f96e2bd85d77e49b0de7854' +
      'dd7d71af67c1796377463662452b0d8d' )
    var newURL = ( 'http://localhost:8000/forms/' + newHash )
    var moving = '(//a[@class="sigil"])[4]'
    var to = '(//*[contains(@class,"dropZone")])[5]'
    test.plan(1)
    test.timeoutAfter(1000 * 1000)
    webdriver
      .url('http://localhost:8000/')
      .waitForExist(moving)
      .waitForExist(to)
      .click(moving)
      .click(to)
      .getUrl()
      .then(function(url) {
        test.equal(
          url, newURL,
          'updates the location bar') }) }) })

tape.onFinish(function() {
  webdriver.end() })
