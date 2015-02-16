var React = require('react');
var validate = require('commonform-validate');

var Definition = require('../components/definition');
var TextString = require('../components/text-string');
var Field = require('../components/field');
var Reference = require('../components/reference');
var Use = require('../components/use');

var mapping = {
  definition: function(element, index) {
    return React.createElement(Definition, {
      key: 'definition' + '-' + element.definition + '@' + index,
      term: element.definition
    });
  },
  field: function(element, index) {
    return React.createElement(Field, {
      key: 'field' + '-' + element.field + '@' + index,
      value: element.field
    });
  },
  reference: function(element, index) {
    return React.createElement(Reference, {
      key: 'reference' + '-' + element.reference + '@' + index,
      summary: element.reference
    });
  },
  use: function(element, index) {
    return React.createElement(Use, {
      key: 'use' + '-' + element.use + '@' + index,
      term: element.use
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
      if (validate[type](contentElement)) {
        return mapping[type](contentElement, index);
      }
    }
  }
};
