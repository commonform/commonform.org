/* jshint mocha: true */
var expect = require('chai').expect;
var Immutable = require('immutable');
var combineStrings = require('../../source/js/helpers/combine-strings');

describe('combineStrings', function() {
  it('is a function', function() {
    expect(combineStrings)
      .to.be.a('function');
  });

  it('collapses contiguous strings', function() {
    var input = Immutable.fromJS({
      content: ['A', 'B']
    });
    var output = Immutable.fromJS({
      content: ['AB']
    });
    expect(Immutable.is(combineStrings(input), output))
      .to.equal(true);
  });

  it('collapses contiguous strings in sub-forms', function() {
    var input = Immutable.fromJS({
      content: [{
        form: {
          content: ['A', 'B']
        }
      }]
    });
    var output = Immutable.fromJS({
      content: [{
        form: {
          content: ['AB']
        }
      }]
    });
    expect(Immutable.is(combineStrings(input), output))
      .to.equal(true);
  });
});
