module.exports = function(type, identifier) {
  switch (type) {
    case 'summary':
      return 'summary-' + identifier;
    case 'definition':
      return 'summary-' + identifier;
  }
};
