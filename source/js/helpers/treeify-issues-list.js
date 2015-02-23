var Immutable = require('immutable');

module.exports = function(issues) {
  return issues.reduce(function(tree, issue) {
    return issue.get('paths').reduce(function(tree, path) {
      return tree.updateIn(path, false, function(list) {
        var object = issue.delete('paths');
        return list === false ?
          Immutable.List([object]) :
          list.push(object);
      });
    }, tree);
  }, Immutable.Map());
};
