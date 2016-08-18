var tape = require('tape')
var mark = require('../utilities/mark-content-elements')

tape('single defined term', function (test) {
  test.deepEqual(
    mark(
      {content: [{definition: 'X'}]},
      ['This has X in it.']
    ),
    ['This has ', {use: 'X'}, ' in it.']
  )
  test.end()
})

tape('single, deep defined term', function (test) {
  test.deepEqual(
    mark(
      {content: [{form: {content: [{definition: 'X'}]}}]},
      ['This has X in it.']
    ),
    ['This has ', {use: 'X'}, ' in it.']
  )
  test.end()
})

tape('single used term', function (test) {
  test.deepEqual(
    mark(
      {content: [{use: 'X'}]},
      ['This has X in it.']
    ),
    ['This has ', {use: 'X'}, ' in it.']
  )
  test.end()
})

tape('single referenced heading', function (test) {
  test.deepEqual(
    mark(
      {content: [{reference: 'X'}]},
      ['This has X in it.']
    ),
    ['This has ', {reference: 'X'}, ' in it.']
  )
  test.end()
})

tape('single utilized heading', function (test) {
  test.deepEqual(
    mark(
      {
        content: [
          {heading: 'X', form: {content: ['Just a test']}}
        ]
      },
      ['This has X in it.']
    ),
    ['This has ', {reference: 'X'}, ' in it.']
  )
  test.end()
})

tape('two-underscore blank', function (test) {
  test.deepEqual(
    mark(
      {content: ['Irrelevant']},
      ['This has __ in it.']
    ),
    ['This has ', {blank: ''}, ' in it.']
  )
  test.end()
})

tape('five-underscore blank', function (test) {
  test.deepEqual(
    mark(
      {content: ['Irrelevant']},
      ['This has _____ in it.']
    ),
    ['This has ', {blank: ''}, ' in it.']
  )
  test.end()
})

tape('single definition', function (test) {
  test.deepEqual(
    mark(
      {content: ['Irrelevant']},
      ['This has a "New Term" defined in it.']
    ),
    ['This has a ', {definition: 'New Term'}, ' defined in it.']
  )
  test.end()
})

tape('definition also a term', function (test) {
  test.deepEqual(
    mark(
      {content: [{use: 'New Term'}]},
      ['This has a "New Term" defined in it.']
    ),
    ['This has a ', {definition: 'New Term'}, ' defined in it.']
  )
  test.end()
})

tape('definition and use', function (test) {
  test.deepEqual(
    mark(
      {content: [{use: 'New Term'}]},
      ['This has a "New Term" defined in it.']
    ),
    ['This has a ', {definition: 'New Term'}, ' defined in it.']
  )
  test.end()
})

tape('use then new definition', function (test) {
  test.deepEqual(
    mark(
      {content: ['Irrelevant']},
      ['Hooray for us. "Hooray" means be happy.']
    ),
    [
      {use: 'Hooray'}, ' for us. ',
      {definition: 'Hooray'}, ' means be happy.'
    ]
  )
  test.end()
})

tape('use at very end', function (test) {
  test.deepEqual(
    mark(
      {content: [{definition: 'Home'}]},
      ['I want to go Home']
    ),
    ['I want to go ', {use: 'Home'}]
  )
  test.end()
})

tape('term and longer term', function (test) {
  test.deepEqual(
    mark(
      {content: [{definition: 'Home'}, {definition: 'Home Run'}]},
      ['We want a Home Run.']
    ),
    ['We want a ', {use: 'Home Run'}, '.']
  )
  test.end()
})

tape('manual reference', function (test) {
  test.deepEqual(
    mark(
      {content: ['Irrelevant']},
      ['See {Bad Office Jokes}.']
    ),
    ['See ', {reference: 'Bad Office Jokes'}, '.']
  )
  test.end()
})

tape('multiple term uses', function (test) {
  test.deepEqual(
    mark(
      {content: [{definition: 'Seller'}]},
      ['Seller and Seller\'s counsel']
    ),
    [{use: 'Seller'}, ' and ', {use: 'Seller'}, '\'s counsel']
  )
  test.end()
})
