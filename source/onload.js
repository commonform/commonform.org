var React = require('react');

var Project = require('./components/project');

document.addEventListener('DOMContentLoaded', function() {
  React.initializeTouchEvents();
  var mount = document.getElementsByClassName('commonform').item(0);
  React.render(React.createElement(Project), mount);
});
