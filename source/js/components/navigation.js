var React = require('react');
var version = require('../../../package.json').version;

var glyphicon = React.createFactory(require('./glyphicon'));

var HELP = 'https://commonform.github.io';

module.exports = React.createClass({
  shouldComponentUpdate: function() {
    return false;
  },

  render: function() {
    var classes = 'navbar navbar-default';
    return React.DOM.div({
      key: 'navbar',
      className: classes
    }, [
      React.DOM.div({
        key: 'container',
        className: 'container'
      }, [
        React.DOM.div({
          key: 'header',
          className: 'navbar-header'
        }, [
          React.DOM.button({
            key: 'button',
            className: 'navbar-toggle collapsed',
            type: 'button',
            'data-toggle':'collapse',
            'data-target':'#navbar'
          }, [
            React.DOM.span({
              key: 'toggle',
              className: 'sr-only'
            }, ['Toggle navigation']),
            React.DOM.span({key:'bar-1'}, ['icon-bar']),
            React.DOM.span({key:'bar-2'}, ['icon-bar']),
            React.DOM.span({key:'bar-3'}, ['icon-bar'])
          ]),
          React.DOM.a({
            key: 'a',
            className: 'navbar-brand',
            href: '#'
          }, ['Common Form'])
        ]),
        React.DOM.div({
          key: 'collapse',
          className: 'collapse navbar-collapse',
          id: 'navbar'
        }, [
          React.DOM.p({
            key: 'version',
            className: 'navbar-text'
          }, ['version ' + version]),
          React.DOM.ul({
            key: 'ul',
            className: 'nav navbar-nav navbar-right'
          }, [
            React.DOM.li({key: 'settings'}, [
              React.DOM.a({
                key: 'settings',
                className: 'settings',
                href: '#settings'
              }, [
                glyphicon({
                  key: 'icon',
                  icon: 'cog'
                }),
                React.DOM.span({key: 'text'}, [' Settings'])
              ])
            ]),
            React.DOM.li({key: 'help'}, [
              React.DOM.a({
                key: 'help',
                className: 'help',
                href: HELP
              }, [
                glyphicon({
                  key: 'icon',
                  icon: 'question-sign'
                }),
                React.DOM.span({key: 'text'}, [' Help'])
              ])
            ])
          ])
        ])
      ])
    ]);
  }
});
