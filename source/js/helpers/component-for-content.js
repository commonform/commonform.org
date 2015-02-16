var React = require('react');
var validate = require('commonform-validate');

var Definition = require('../components/definition');
var TextString = require('../components/text-string');
var Field = require('../components/field');
var Reference = require('../components/reference');
var Use = require('../components/use');

var mapping = {
  definition: function(element, path) {
    return React.createElement(Definition, {
      key: path.join('.') + 'definition' + '.' + element.definition,
      term: element.definition
    });
  },
  field: function(element, path) {
    return React.createElement(Field, {
      key: path.join('.') + 'field' + '.' + element.field,
      value: element.field
    });
  },
  reference: function(element, path) {
    return React.createElement(Reference, {
      key: path.join('.') + 'reference' + '.' + element.reference,
      summary: element.reference
    });
  },
  use: function(element, path) {
    return React.createElement(Use, {
      key: path.join('.') + 'use' + '.' + element.use,
      term: element.use
    });
  }
};

module.exports = function(contentElement, path) {
  if (typeof contentElement === 'string') {
    return React.createElement(TextString, {
      key: path.join('.'),
      string: contentElement
    });
  } else {
    for (var type in mapping) {
      if (validate[type](contentElement)) {
        return mapping[type](contentElement, path);
      }
    }
  }
};
