require('tape')('Default Heading', function(test) {
  test.plan(2);

  require('webdriverio')
    .remote()
    .init()
    .url('http://localhost:8081')
    .getText('h1', function(error, text) {
      test.ifError(error, 'get heading');
      test.equal(
        text, 'Untitled Agreement',
        'heading is "Untitled Agreement"'
      );
    })
    .end();
});
