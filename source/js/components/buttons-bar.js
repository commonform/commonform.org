var React = require('react');
var docx = require('commonform-docx');
var saveAs = require('filesaver.js');

var buttonLink = React.createFactory(require('./button-link'));

var DOM = React.DOM;
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
          buttonLink({
            key: 'docx',
            text: 'Save .docx',
            icon: 'floppy-save',
            onClick: this.handleSaveDOCX
          }),
          buttonLink({
            key: 'json',
            text: 'Save .form',
            icon: 'floppy-save',
            onClick: this.handleSaveCommonForm
          })
        ])
      ])
    ]);
  }
});
