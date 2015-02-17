var Immutable = require('immutable');
var isMap = Immutable.Map.isMap.bind(Immutable.Map);

var isString = function(argument) {
  return typeof argument === 'string';
};

module.exports = function combine(argument) {
  return argument.update('content', function(content) {
    return content.reduce(function(out, element, index) {
      if (isMap(element) && element.has('form')) {
        var combined = combine(element.get('form'));
        var newForm = element.set('form', combined);
        return out.push(newForm);
      } else {
        var length = out.count();
        var last = out.get(length - 1);
        if (isString(element) && index > 0 && isString(last)) {
          return out.set(length - 1, last + element);
        } else {
          return out.push(element);
        }
      }
    }, Immutable.List());
  });
};
