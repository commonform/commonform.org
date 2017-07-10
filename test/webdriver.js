var spawn = require('child_process').spawn
var path = require('path')

var chromedriver = spawn(
  path.join(
    __dirname, '..', 'node_modules', '.bin', 'chromedriver'
  ),
  ['--url-base=/wd/hub']
)

var webdriver = module.exports = (function () {
  return require('webdriverio')
    .remote(configuration())
    .init()
    .timeouts('script', 1000)
    .timeouts('implicit', 1000)
})()

function configuration () {
  return (
    process.env.CI === 'true'
      ? {
        host: 'localhost',
        port: 4445,
        user: process.env.SAUCE_USERNAME,
        key: process.env.SAUCE_ACCESS_KEY,
        desiredCapabilities: {
          browserName: 'chrome',
          platform: 'Windows 7',
          version: '47.0',
          build: process.env.TRAVIS_BUILD_NUMBER,
          'tunnel-identifier': process.env.TRAVIS_JOB_NUMBER
        }
      }
      : {
        host: 'localhost',
        port: 9515,
        desiredCapabilities: {
          browserName: 'chrome',
          chromeOptions: process.env.DISABLE_HEADLESS
            ? undefined
            : {args: ['headless', '--disable-gpu']}
        }
      }
  )
}

process
  .on('SIGTERM', cleanupAndExit)
  .on('SIGQUIT', cleanupAndExit)
  .on('SIGINT', cleanupAndExit)
  .on('uncaughtException', cleanupAndExit)

function cleanup () {
  webdriver.end()
  chromedriver.kill('SIGKILL')
}

function cleanupAndExit () {
  cleanup()
  process.exit(1)
}

require('tape').onFinish(cleanup)
