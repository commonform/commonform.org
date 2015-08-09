require('tape')('Button', function(test) {
  test.plan(2)
  require('./driver')()
    .click('button')
    .getText('h1')
    .then(function(value) {
      test.equal(value, 'clicked 1 times', 'h1 text updated')
     })
    .click('button')
    .getText('h1')
    .then(function(value) {
      test.equal(value, 'clicked 2 times', 'h1 text updated again')
     })
    .end()
})
