var spawn = require('child_process').spawn
var path = require('path')
var tape = require('tape')

tape.onFinish(cleanup)

var chromedriver = spawn(
  path.join(
    __dirname, '..', 'node_modules', '.bin', 'chromedriver'
  ),
  ['--url-base=/wd/hub']
)

var webdriver = module.exports = require('webdriverio')
  .remote({
    host: 'localhost',
    port: 9515,
    desiredCapabilities: {
      browserName: 'chrome',
      chromeOptions: process.env.DISABLE_HEADLESS
        ? undefined
        : {args: ['headless', '--disable-gpu']}
    }
  })
  .init()
  .timeouts('script', 1000)
  .timeouts('implicit', 1000)

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

webdriver.shutdown = cleanup
