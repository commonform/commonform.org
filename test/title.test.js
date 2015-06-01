require('tape')('Page Title', function(test) {
  test.plan(2);

  require('webdriverio')
    .remote()
    .init()
    .url('http://localhost:8080')
    .getTitle(function(error, title) {
      test.ifError(error);
      test.ok(
        title.indexOf('Common Form') > -1,
        'title contains "Common Form"'
      );
    })
    .end();
});
