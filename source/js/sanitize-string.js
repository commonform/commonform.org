var ILLEGAL = /[^\x20-\x7E]/g;

module.exports = function(argument) {
  return argument
    .trim()
    .replace(ILLEGAL, '')
    .replace(/ +/g, ' ');
};
