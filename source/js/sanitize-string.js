module.exports = function(argument) {
  return argument
    .trim()
    .replace(/ +/g, ' ');
};
