var Immutable = require('immutable');
var React = require('react');
var docx = require('commonform-docx');
var markup = require('commonform-markup');
var saveAs = require('filesaver.js');

var formChange = require('../actions/form-change');
var buttonLink = React.createFactory(require('./button-link'));

var DOM = React.DOM;
var div = DOM.div;

var jsonBlob = function(object) {
  return new Blob([JSON.stringify(object)], {type: 'application/json'});
};

var openLocal = function(callback) {
  if (
    window.File && window.FileReader && window.FileList && window.Blob
  ) {
    var input = document.createElement('input');
    input.type = 'file';
    input.addEventListener('change', function(event) {
      var file = event.target.files[0];
      var reader = new FileReader();
      reader.addEventListener('load', function(event) {
        callback(event.target.result);
      });
      reader.readAsText(file, 'ascii');
    });
    var event = document.createEvent('MouseEvents');
    event.initEvent('click', true, true);
    input.dispatchEvent(event);
  } else {
    window.alert('Your web browser does not support reading files');
  }
};

module.exports = React.createClass({
  fileName: function(extension) {
    var title = this.props.project.get('metadata').get('title');
    var date = new Date().toISOString();
    return '' + title + ' ' + date + '.' + extension;
  },

  handleSaveJSON: function() {
    var blob = jsonBlob(this.props.project.toJS());
    saveAs(blob, this.fileName('json'));
  },

  handleOpenJSON: function() {
    openLocal(function(content) {
      var project = JSON.parse(content);
      // TODO: Load other parts of project, too
      formChange({
        type: 'set',
        path: Immutable.List(),
        value: Immutable.fromJS(project.form)
      });
    });
  },

  handleOpenMarkup: function() {
    // TODO: Load other parts of project, too
    openLocal(function(fileContent) {
      var form = markup.parseLines(fileContent);
      formChange({
        type: 'set',
        path: Immutable.List(),
        value: Immutable.fromJS(form)
      });
    });
  },

  handleSaveDOCX: function() {
    // TODO: Remove terrible hack
    var zip = docx(this.props.project.toJS());
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
            key: 'saveDOCX',
            text: 'Save .docx',
            icon: 'floppy-save',
            onClick: this.handleSaveDOCX
          }),
          buttonLink({
            key: 'saveJSON',
            text: 'Save .JSON',
            icon: 'floppy-save',
            onClick: this.handleSaveJSON
          }),
          buttonLink({
            key: 'openJSON',
            text: 'Open .JSON',
            icon: 'floppy-open',
            onClick: this.handleOpenJSON
          }),
          buttonLink({
            key: 'openMarkup',
            text: 'Open .commonform',
            icon: 'floppy-open',
            onClick: this.handleOpenMarkup
          })
        ])
      ])
    ]);
  }
});
