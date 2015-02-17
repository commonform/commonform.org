var Reflux = require('reflux');
var Immutable = require('immutable');
var version = require('commonform-validate').version;

var formStore = require('../stores/form-store');
var metadataStore = require('../stores/metadata-store');
var valuesStore = require('../stores/values-store');

module.exports = Reflux.createStore({
  init: function() {
    this.project = this.getInitialState();
    this.listenTo(formStore, this.onForm);
    this.listenTo(metadataStore, this.onMetadata);
    this.listenTo(valuesStore, this.onValues);
  },

  getInitialState: function() {
    return Immutable.Map({
      commonform: version,
      form: formStore.getInitialState(),
      metadata: metadataStore.getInitialState(),
      preferences: Immutable.Map(),
      values: valuesStore.getInitialState()
    });
  },

  onForm: function(form) {
    this.project = this.project.set('form', form);
    this.trigger(this.project);
  },

  onValues: function(values) {
    this.project = this.project.set('values', values);
    this.trigger(this.project);
  },

  onMetadata: function(metadata) {
    this.project = this.project.set('metadata', metadata);
    this.trigger(this.project);
  }
});
