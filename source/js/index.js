var React = require('react');
var Reflux = require('reflux');

var Form = require('./form');

document.addEventListener('DOMContentLoaded', function() {
  var formChange = Reflux.createAction();
  var preferencesChange = Reflux.createAction();
  var valuesChange = Reflux.createAction();

  var formStore = Reflux.createStore({
    init: function() {
      this.listenTo(formChange, this.output);
    },
    output: function(newForm) {
      this.trigger(newForm);
    }
  });

  var preferencesStore = Reflux.createStore({
    init: function() {
      this.listenTo(preferencesChange, this.output);
    },
    output: function(value) {
      this.trigger(value);
    }
  });

  var valuesStore = Reflux.createStore({
    init: function() {
      this.listenTo(valuesChange, this.output);
    },
    output: function(value) {
      this.trigger(value);
    }
  });

  React.initializeTouchEvents(true);

  var element = document.getElementsByClassName('project')[0];
  var project = {
    form: {
      content: ['This is a test']
    },
    path: []
  };

  var Project = React.createClass({
    mixins: [Reflux.ListenerMixin],
    onFormChange: function(form) {
      this.setProps({form: form});
    },
    componentDidMount: function() {
      this.listenTo(formStore, this.onFormChange);
    },
    render: function() {
      var form = React.createElement(Form, {
        content: this.props.form.content,
        conspicuous: this.props.form.conspicuous,
        path: this.props.path.concat('form')
      });
      return React.DOM.div({className: 'project'}, form);
    }
  });

  var component = React.createElement(Project, project);
  React.render(component, element);

  formChange({
   content:[
     'This ',
     {definition: 'Agreement'},
     ' has defined the term ',
     {use: 'Agreement'},
     ' with a field ',
     {field: 'Some Value'},
     ' and a reference ',
     {
       summary: 'A Summary',
       form: {
         content: [
           'Text in a sub-form!'
         ]
       }
     },
     {reference: 'Another Summary'}
   ]
  });
});
