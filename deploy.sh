#!/bin/bash

BUILD=build
ROOT=/var/www/commonform.org
FLAGS="--verbose --checksum --recursive --sparse --compress --human-readable --progress"

if [ -z "$1" ]; then
  echo "Usage: deploy.sh REF"
  exit 1
else
  (
    set -e
    COMMIT=`git rev-parse "$1"`
    BASE="s/<head>/<head><base href='https:\/\/commonform.org\/releases\/$COMMIT\/'>/"
    GITDIR=`pwd`
    TMPDIR=`mktemp -d`
    trap "{ cd "$GITDIR" ; rm -rf "$TMPDIR"; exit 255; }" SIGINT EXIT
    git clone -s "$GITDIR" "$TMPDIR"
    cd $TMPDIR
    npm install
    npm run build
    rsync $FLAGS $BUILD/* commonform.org:$ROOT/releases/$COMMIT
    cat $BUILD/index.html | sed -e "$BASE" > index.html
    rsync $FLAGS index.html commonform.org:$ROOT/
  )
fi
