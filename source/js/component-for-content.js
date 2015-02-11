var React = require('react');
var validate = require('commonform-validate');

var Definition = require('./definition');
var TextString = require('./text-string');
var Field = require('./field');
var Reference = require('./reference');
var Use = require('./use');

var mapping = {
  definition: function(element, path) {
    return React.createElement(Definition, {
      key: path.join('.'),
      term: element.definition
    });
  },
  field: function(element, path) {
    return React.createElement(Field, {
      key: path.join('.'),
      value: element.field
    });
  },
  reference: function(element, path) {
    return React.createElement(Reference, {
      key: path.join('.'),
      summary: element.reference
    });
  },
  use: function(element, path) {
    return React.createElement(Use, {
      key: path.join('.'),
      term: element.use
    });
  },
  form: function(element, path) {
    // TODO: Pull series detection logic out of other module
  }
};

module.exports = function(contentElement, path) {
  if (typeof contentElement === 'string') {
    return React.createElement(TextString, {
      key: path,
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
