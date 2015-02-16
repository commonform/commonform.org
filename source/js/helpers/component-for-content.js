var React = require('react');
var validate = require('commonform-validate');

var Definition = require('../components/definition');
var TextString = require('../components/text-string');
var Field = require('../components/field');
var Reference = require('../components/reference');
var Use = require('../components/use');

var mapping = {
  definition: function(element) {
    return React.createElement(Definition, {
      key: 'definition' + '-' + element.definition,
      term: element.definition
    });
  },
  field: function(element) {
    return React.createElement(Field, {
      key: 'field' + '-' + element.field,
      value: element.field
    });
  },
  reference: function(element) {
    return React.createElement(Reference, {
      key: 'reference' + '-' + element.reference,
      summary: element.reference
    });
  },
  use: function(element) {
    return React.createElement(Use, {
      key: 'use' + '-' + element.use,
      term: element.use
    });
  }
};

module.exports = function(contentElement) {
  if (typeof contentElement === 'string') {
    return React.createElement(TextString, {
      key: contentElement,
      string: contentElement
    });
  } else {
    for (var type in mapping) {
      if (validate[type](contentElement)) {
        return mapping[type](contentElement);
      }
    }
  }
};
