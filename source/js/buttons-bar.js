var glyphicon = React.createFactory(require('./glyphicon'));
var docx = require('commonform-docx');
var saveAs = require('filesaver.js');
var DOM = React.DOM;

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
    return DOM.div({className: 'container'}, [
      DOM.div({className: 'row'}, [
        DOM.div({className: 'btn-group btn-group-justified'}, [
          DOM.a({
            className: 'btn btn-default',
            onClick: this.handleSaveDOCX
          }, [
            glyphicon({icon: 'floppy-save'}),
            ' Save .docx'
          ]),
          DOM.a({
            className: 'btn btn-default',
            onClick: this.handleSaveCommonForm
          }, [
            glyphicon({icon: 'floppy-save'}),
            ' Save .form'
          ])
          // DOM.a({className: 'btn btn-default'}, [
          //   glyphicon({icon: 'cloud-upload'}),
          //   ' Share to library'
          // ])
        ])
      ])
    ]);
  }
});
