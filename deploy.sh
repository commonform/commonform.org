#!/bin/bash
# Build the application from a clean slate and deploy to commonform.org.

# Directory where built files end up.
BUILD=build

# File server directory on commonform.org.
ROOT=/var/www/commonform.org

# Rsync flags.
FLAGS="--verbose --checksum --recursive --sparse --compress --human-readable --progress"

# The Git ref to deploy.
REF=${1:-HEAD}

# Subshell.
(
	# Fail on any error.
	set -e

	# The Git commit hash. This becomes the name of a new subdirectory in ROOT.
	COMMIT=`git rev-parse "$REF"`
	GITDIR=`pwd`

	# Make a temporary directory. The build script will do a clean-slate
	# build there.
	TMPDIR=`mktemp -d`

	# Remove the temporary directory if something goes wrong.
	trap "{ cd "$GITDIR" ; rm -rf "$TMPDIR"; exit 255; }" SIGINT EXIT

	# Clone Git-tracked sources to the temporary directory.
	git clone -s "$GITDIR" "$TMPDIR"

	# Change to the temporary directory.
	cd $TMPDIR

	# Install dependencies.
	npm install

	# Create a shrinkwrap manifest as a build artifact. The project itself
	# isn't actually shrinkwrapped. It's just have these manifests handy
	# in the deployed directories for debugging later.
	npm shrinkwrap --dev
	mv npm-shrinkwrap.json build/npm-shrinkwrap.json

	# Build.
	NODE_ENV=production npm run build

	# Replace the "RELEASE" placeholder in the HTML index with the path of
	# this build as deployed to ROOT on commonform.org.
	sed -ie "s/RELEASE\//https:\/\/commonform.org\/releases\/$COMMIT\//" $BUILD/index.html

	# Copy build files to the new directory in ROOT.
	rsync $FLAGS $BUILD/* commonform.org:$ROOT/releases/$COMMIT

	# Copy the new index.html to ROOT itself, as well, replacing the
	# current index.html. This ensures that new visitors will download
	# the newest index.html, which will, in turn, load assets from this
	# build's directory in ROOT.
	rsync $FLAGS $BUILD/index.html commonform.org:$ROOT/
)
