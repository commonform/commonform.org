#!/bin/bash
set -e

echo "Starting chromedriver."
npm run chromedriver &> chromedriver.log &

echo "Starting application and API servers."
npm run start &> servers.log &

echo "Building."
npm run build:css &
CSS_PID="$!"
npm run build:js &
JS_PID="$!"
wait "$CSS_PID" "$JS_PID"

echo "Running tests."
npm test

exit
