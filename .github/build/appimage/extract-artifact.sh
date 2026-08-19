#!/bin/sh

set -eu

echo "Extracting Artifact..."
echo "---------------------------------------------------------------"

mkdir -p ./AppDir/bin
unzip /tmp/learnet/Learnet-linux-*.zip
mv -v ./Learnet-linux-"$BUILD_ARCH"/* ./AppDir/bin

echo "Packaging as version $BUILD_VERSION"
echo "$BUILD_VERSION" > ~/version