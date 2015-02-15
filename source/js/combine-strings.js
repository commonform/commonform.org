var isString = function(argument) {
  return typeof argument === 'string';
};

module.exports = function combine(argument) {
  var content = argument.content;
  argument.content = content.reduce(function(out, element, i) {
    if (element.hasOwnProperty('form')) {
      element.form = combine(element.form);
      return out.concat(element);
    } else {
      var length = out.length;
      var last = out[length - 1];
      if (isString(element) && i > 0 && isString(last)) {
        out[out.length - 1] = last + element;
        return out;
      } else {
        return out.concat(element);
      }
    }
  }, []);
  return argument;
};
