var React = require('react');
var docx = require('commonform-docx');
var saveAs = require('filesaver.js');

var glyphicon = React.createFactory(require('./glyphicon'));

var DOM = React.DOM;
var a = DOM.a;
var div = DOM.div;

var jsonBlob = function(object) {
  return new Blob([JSON.stringify(object)], {type: 'application/json'});
};

module.exports = React.createClass({
  fileName: function(extension) {
    var title = this.props.project.metadata.title;
    var date = new Date().toISOString();
    return '' + title + ' ' + date + '.' + extension;
  },

  handleSaveCommonForm: function() {
    var blob = jsonBlob(this.props.project);
    saveAs(blob, this.fileName('form'));
  },

  handleSaveDOCX: function() {
    var zip = docx(this.props.project);
    saveAs(zip.generate({type: 'blob'}), this.fileName('docx'));
  },

  shouldComponentUpdate: function() {
    return false;
  },

  render: function() {
    return div({
      key: 'container',
      className: 'container'
    }, [
      div({
        key: 'row',
        className: 'row'
      }, [
        div({
          key: 'buttonGroup',
          className: 'btn-group btn-group-justified'
        }, [
          a({
            key: 'docx',
            className: 'btn btn-default',
            onClick: this.handleSaveDOCX
          }, [
            glyphicon({
              key: 'icon',
              icon: 'floppy-save'
            }),
            React.DOM.span({key: 'text'}, [' Save .docx'])
          ]),
          a({
            key: 'json',
            className: 'btn btn-default',
            onClick: this.handleSaveCommonForm
          }, [
            glyphicon({
              key: 'icon',
              icon: 'floppy-save'
            }),
            React.DOM.span({key: 'text'}, [' Save .form'])
          ])
          // a({className: 'btn btn-default'}, [
          //   glyphicon({icon: 'cloud-upload'}), ' Share to library'
          // ])
        ])
      ])
    ]);
  }
});
