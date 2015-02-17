var React = require('react');
var version = require('../../../package.json').version;

var glyphicon = React.createFactory(require('./glyphicon'));

var DOM = React.DOM;
var a = DOM.a;
var div = DOM.div;
var span = DOM.span;

var HELP = 'https://commonform.github.io';

module.exports = React.createClass({
  displayName: 'Navigation',

  shouldComponentUpdate: function() {
    return false;
  },

  render: function() {
    var classes = 'navbar navbar-default';
    return div({
      key: 'navbar',
      className: classes
    }, [
      div({
        key: 'container',
        className: 'container'
      }, [
        div({
          key: 'header',
          className: 'navbar-header'
        }, [
          DOM.button({
            key: 'button',
            className: 'navbar-toggle collapsed',
            type: 'button',
            'data-toggle':'collapse',
            'data-target':'#navbar'
          }, [
            span({
              key: 'toggle',
              className: 'sr-only'
            }, 'Toggle navigation'),
            span({key:'bar-1', className: 'icon-bar'}),
            span({key:'bar-2', className: 'icon-bar'}),
            span({key:'bar-3', className: 'icon-bar'})
          ]),
          a({
            key: 'a',
            className: 'navbar-brand',
            href: '#'
          }, 'Common Form')
        ]),
        div({
          key: 'collapse',
          className: 'collapse navbar-collapse',
          id: 'navbar'
        }, [
          DOM.p({
            key: 'version',
            className: 'navbar-text'
          }, 'version ' + version),
          DOM.ul({
            key: 'ul',
            className: 'nav navbar-nav navbar-right'
          }, [
            DOM.li({key: 'help'}, [
              a({
                key: 'help',
                className: 'help',
                href: HELP
              }, [
                glyphicon({
                  key: 'icon',
                  icon: 'question-sign'
                }),
                span({key: 'text'}, ' About')
              ])
            ])
          ])
        ])
      ])
    ]);
  }
});
