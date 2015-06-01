// Polyfill for PhantomJS
Function.prototype.bind = require('function-bind');

var React = require('react');

var Project = require('./components/project');

React.initializeTouchEvents();

React.render(
  React.createElement(Project),
  document.getElementsByClassName('commonform').item(0)
);
