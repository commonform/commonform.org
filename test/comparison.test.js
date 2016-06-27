var tape = require('tape')
var webdriver = require('./webdriver')

tape('Comparison', function(suite) {
  var apache2 = (
    '5d912ab4e9be029a2b3d137aefeb918a' +
    'd1f001463e0f554ca24008dc70494eb0' )

  var apache2edit = (
    'dad34e74228090369e96aae72b874206' +
    '39c93de9e544dbc920a03832a0754f9c' )

  suite.test(function(test) {
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

  suite.test(function(test) {
    test.plan(1)
    webdriver
      .url(
        'http://localhost:8000/forms/' + apache2 +
        '#compare:' + apache2edit)
      .isExisting('//del/span[contains(text(),"whether")]')
      .then(function(existing) {
        test.assert(
          existing,
          'Displays "whether" as a deletion.') }) })

  var abc = (
    'b34c42c6b0620405d352d1987ab6b758' +
    '6634c136c8b7fca26e15abc2ce3e62f0' )

  var bcd = (
    'ca4b4d97de8c014df46d17d17e1de72e' +
    '8fb942e1b6f0d72b5eddf56af4418967' )

  suite.test(function(test) {
    test.plan(1)
    webdriver
      .url('http://localhost:8000/forms/' + abc + '#compare:' + bcd)
      .isExisting('//del/p[contains(text(),"This is A.")]')
      .then(function(existing) {
        test.assert(
          existing,
          'Displays This is A." as a deletion.') }) })

  suite.test(function(test) {
    test.plan(1)
    webdriver
      .url('http://localhost:8000/forms/' + abc + '#compare:' + bcd)
      .isExisting('//ins/p[contains(text(),"This is D.")]')
      .then(function(existing) {
        test.assert(
          existing,
          'Displays "This is D." as an insertion.') }) })

  var a = (
    '3e0a6550ad6afb461c5a217bd24f5424' +
    '7405a31fb1a06b705acf35c7010a599b' )

  var aConspicuous = (
    '1111d342cef09cf3eb11b30c565a3c7a' +
    '9080b01665dcf1cc2ebab99c7efdb2ea' )

  suite.test(function(test) {
    test.plan(1)
    webdriver
      .url('http://localhost:8000/forms/' + a + '#compare:' + aConspicuous)
      .isExisting('//*[contains(text(),"Made conspicuous")]')
      .then(function(existing) {
        test.assert(
          existing,
          'Displays "Made conspicuous".') }) })

  suite.test(function(test) {
    test.plan(1)
    webdriver
      .url('http://localhost:8000/forms/' + aConspicuous + '#compare:' + a)
      .isExisting('//*[contains(text(),"Made inconspicuous")]')
      .then(function(existing) {
        test.assert(
          existing,
          'Displays "Made inconspicuous".') }) }) })
