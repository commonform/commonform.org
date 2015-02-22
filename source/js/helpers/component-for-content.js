var React = require('react');
var predicate = require('commonform-predicate');

var Definition = require('../components/definition');
var Field = require('../components/field');
var Reference = require('../components/reference');
var TextString = require('../components/text-string');
var Use = require('../components/use');

var mapping = {
  definition: function(element, index) {
    var term = element.get('definition');
    return React.createElement(Definition, {
      key: 'definition' + '-' + term + '@' + index,
      term: term
    });
  },
  field: function(element, index) {
    var field = element.get('field');
    return React.createElement(Field, {
      key: 'field' + '-' + field + '@' + index,
      value: field
    });
  },
  reference: function(element, index) {
    var summary = element.get('reference');
    return React.createElement(Reference, {
      key: 'reference' + '-' + summary + '@' + index,
      summary: summary
    });
  },
  use: function(element, index) {
    var term = element.get('use');
    return React.createElement(Use, {
      key: 'use' + '-' + term + '@' + index,
      term: term
    });
  }
};

module.exports = function(contentElement, index) {
  if (typeof contentElement === 'string') {
    return React.createElement(TextString, {
      key: contentElement + '@' + index,
      string: contentElement
    });
  } else {
    for (var type in mapping) {
      if (predicate[type](contentElement)) {
        return mapping[type](contentElement, index);
      }
    }
  }
};
