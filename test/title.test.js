require('tape')('Page Title', function(test) {
  test.plan(2);

  require('webdriverio')
    .remote()
    .init()
    .url('http://localhost:8081')
    .getTitle(function(error, title) {
      test.ifError(error, 'get title');
      test.ok(
        title.indexOf('Common Form') > -1,
        'title contains "Common Form"'
      );
    })
    .end();
});
