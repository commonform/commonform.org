var Reflux = require('reflux');
var indepth = require('indepth');

var combineStrings = require('../helpers/combine-strings');
var formChange = require('../actions/form-change');

module.exports = Reflux.createStore({
  init: function() {
    this.listenTo(formChange, this.onFormChange);
    this.form = this.getInitialState();
  },

  getInitialState: function() {
    return {
      content: [
        'This ',
        {definition: 'Agreement'},
        {
          summary: 'A Summary',
          form: {content: ['Text in a sub-form!']}
        },
        {reference: 'Another Summary'}
      ]
    };
  },

  onFormChange: function(instruction) {
    var type = instruction.type;
    var path = instruction.path;
    var value = instruction.value;
    switch (type) {
      case 'set':
        indepth.set(this.form, path, value);
        break;
      case 'del':
        indepth.del(this.form, path);
        break;
      case 'insert':
        indepth.insert(this.form, path, value);
        break;
      case 'splice':
        var array = indepth.get(this.form, path);
        var args = [instruction.offset, instruction.length];
        if (instruction.value) {
          args = args.concat(instruction.value);
        }
        array.splice.apply(array, args);
        break;
      default:
        throw new Error('Unrecognized instruction "' + type + '"');
    }
    combineStrings(this.form);
    this.trigger(this.form);
  }
});
