const tape = require('tape')
const webdriver = require('./webdriver')

tape('Comparison', function (suite) {
  const apache2 = '5d912ab4e9be029a2b3d137aefeb918ad1f001463e0f554ca24008dc70494eb0'

  const edited = 'f02d98846a09ce8431c4d2968c265672842ab20322c21e1ee87a0de6943e7a1b'

  suite.test(function (test) {
    test.plan(1)
    webdriver
      .url(
        'http://localhost:8000/forms/' + apache2 +
        '#compare:' + edited)
      .isExisting('//*[contains(text(),"compared to")]')
      .then(function (existing) {
        test.assert(
          existing,
          'Displays "compared to" when diffing.'
        )
      })
  })

  suite.test(function (test) {
    test.plan(1)
    webdriver
      .url(
        'http://localhost:8000/forms/' + apache2 +
        '#compare:' + edited)
      .isExisting('//del//span[contains(text(),"whether")]')
      .then(function (existing) {
        test.assert(
          existing,
          'Displays "whether" as a deletion.'
        )
      })
  })

  const abc = 'b34c42c6b0620405d352d1987ab6b7586634c136c8b7fca26e15abc2ce3e62f0'

  const bcd = 'ca4b4d97de8c014df46d17d17e1de72e8fb942e1b6f0d72b5eddf56af4418967'

  suite.test(function (test) {
    test.plan(1)
    webdriver
      .url('http://localhost:8000/forms/' + abc + '#compare:' + bcd)
      .waitForExist('//del//p[contains(text(),"This is A.")]')
      .isExisting('//del//p[contains(text(),"This is A.")]')
      .then(function (existing) {
        test.assert(
          existing,
          'Displays This is A." as a deletion.'
        )
      })
  })

  suite.test(function (test) {
    test.plan(1)
    webdriver
      .url('http://localhost:8000/forms/' + abc + '#compare:' + bcd)
      .waitForExist('//ins//p[contains(text(),"This is D.")]')
      .isExisting('//ins//p[contains(text(),"This is D.")]')
      .then(function (existing) {
        test.assert(
          existing,
          'Displays "This is D." as an insertion.'
        )
      })
  })

  const a = '3e0a6550ad6afb461c5a217bd24f54247405a31fb1a06b705acf35c7010a599b'

  const aConspicuous = '1111d342cef09cf3eb11b30c565a3c7a9080b01665dcf1cc2ebab99c7efdb2ea'

  suite.test(function (test) {
    test.plan(1)
    webdriver
      .url('http://localhost:8000/forms/' + a + '#compare:' + aConspicuous)
      .waitForExist('//*[contains(text(),"Made conspicuous")]')
      .isExisting('//*[contains(text(),"Made conspicuous")]')
      .then(function (existing) {
        test.assert(
          existing,
          'Displays "Made conspicuous".'
        )
      })
  })

  suite.test(function (test) {
    test.plan(1)
    webdriver
      .url('http://localhost:8000/forms/' + aConspicuous + '#compare:' + a)
      .waitForExist('//*[contains(text(),"Made inconspicuous")]')
      .isExisting('//*[contains(text(),"Made inconspicuous")]')
      .then(function (existing) {
        test.assert(
          existing,
          'Displays "Made inconspicuous".'
        )
      })
  })
})
