#!/bin/sh

set -eu

# Force pacman to never prompt for confirmation globally
export PACMAN_CONFIRM=no  # (or check if the tool accepts flags)

echo "Installing package dependencies..."
echo "---------------------------------------------------------------"
pacman -Syu --noconfirm libnss_nis nss-mdns nss pipewire

echo "Installing debloated packages..."
echo "---------------------------------------------------------------"
# Pass --noconfirm if the script/wrapper accepts arguments:
get-debloated-pkgs --add-common --prefer-nano --noconfirm