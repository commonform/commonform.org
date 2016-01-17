module.exports = function() {
  return require('webdriverio')
    .remote(configuration())
    .init()
    .url('http://localhost:8000') }

function configuration() {
  return (
    process.env.CI === 'true' ?
      { host: 'localhost',
        port: 4445,
        user: process.env.SAUCE_USERNAME,
        key: process.env.SAUCE_ACCESS_KEY,
        desiredCapabilities: {
          browserName: 'chrome',
          platform: 'Windows 7',
          version: '47.0',
          'tunnel-identifier': process.env.TRAVIS_JOB_NUMBER } } :
      { host: 'localhost',
        port: 9515,
        desiredCapabilities: {
          browserName: 'chrome' } } ) }
