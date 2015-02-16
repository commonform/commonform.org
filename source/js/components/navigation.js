var React = require('react');
var version = require('../../../package.json').version;

var HELP = 'https://commonform.github.io';

var span = function(className) {
  return React.DOM.span({className: className});
};

module.exports = React.createClass({
  render: function() {
    var classes = 'navbar navbar-default';
    return React.DOM.div({className: classes}, [
      React.DOM.div({className: 'container'}, [
        React.DOM.div({className: 'navbar-header'}, [
          React.DOM.button({
            className: 'navbar-toggle collapsed',
            type: 'button',
            'data-toggle':'collapse',
            'data-target':'#navbar'
          }, [
            React.DOM.span({className: 'sr-only'}, 'Toggle navigation'),
            span('icon-bar'),
            span('icon-bar'),
            span('icon-bar')
          ]),
          React.DOM.a({
            className: 'navbar-brand',
            href: '#'
          }, 'Common Form')
        ]),
        React.DOM.div({
          className: 'collapse navbar-collapse',
          id: 'navbar'
        }, [
          React.DOM.p({className: 'navbar-text'}, 'version ' + version),
          React.DOM.ul({className: 'nav navbar-nav navbar-right'}, [
            React.DOM.li({}, [
              React.DOM.a({className: 'settings', href: '#settings'}, [
                span('glyphicon glyphicon-cog'),
                ' Settings'
              ])
            ]),
            React.DOM.li({}, [
              React.DOM.a({className: 'help', href: HELP}, [
                span('glyphicon glyphicon-question-sign'),
                ' Help'
              ])
            ])
          ])
        ])
      ])
    ]);
  }
});
