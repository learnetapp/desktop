#!/bin/sh

set -eu

echo "Installing package dependencies..."
echo "---------------------------------------------------------------"
pacman -Syu --noconfirm libnss_nis nss-mdns nss pipewire

echo "Installing debloated packages..."
echo "---------------------------------------------------------------"
# Pipe 'yes' into the command so it automatically responds "y" to any prompt
yes | get-debloated-pkgs --add-common --prefer-nano