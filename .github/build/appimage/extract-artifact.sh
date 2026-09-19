#!/bin/sh

set -eu

echo "Extracting Artifact..."
echo "---------------------------------------------------------------"

mkdir -p ./AppDir/bin
tar -xzf /tmp/learnet/Learnet.tar.gz -C ./AppDir/bin

echo "Contents of AppDir/bin:"
ls -la ./AppDir/bin

echo "Packaging as version $BUILD_VERSION"
echo "$BUILD_VERSION" > ~/version