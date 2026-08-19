<div align="center">
<h1>
  Learnet for Desktop
  
  [![Stars](https://img.shields.io/github/stars/learnet/desktop?style=flat-square&logoColor=white)](https://github.com/learnett/desktop/stargazers)
  [![Forks](https://img.shields.io/github/forks/learnet/desktop?style=flat-square&logoColor=white)](https://github.com/learnett/desktop/network/members)
  [![Pull Requests](https://img.shields.io/github/issues-pr/learnet/desktop?style=flat-square&logoColor=white)](https://github.com/learnett/desktop/pulls)
  [![Issues](https://img.shields.io/github/issues/learnet/desktop?style=flat-square&logoColor=white)](https://github.com/learnett/desktop/issues)
  [![Contributors](https://img.shields.io/github/contributors/learnet/desktop?style=flat-square&logoColor=white)](https://github.com/learnett/desktop/graphs/contributors)
  [![License](https://img.shields.io/github/license/learnet/desktop?style=flat-square&logoColor=white)](https://github.com/learnett/desktop/blob/main/LICENSE)
</h1>
Application for Windows, macOS, and Linux.
</div>
<br/>

## Installation

<a href="https://repology.org/project/learnet-desktop/versions">
    <img src="https://repology.org/badge/vertical-allrepos/learnet-desktop.svg" alt="Packaging status" align="right">
</a>

- All downloads and instructions for Learnet can be found on our [Website](https://learnet.app/download).

## Development Guide

_Contribution guidelines for Desktop app TBA!_

<!-- Before contributing, make yourself familiar with [our contribution guidelines](https://developers.learnet.app/contrib.html), the [code style guidelines](./GUIDELINES.md), and the [technical documentation for this project](https://learnet.github.io/frontend/). -->

Before getting started, you'll want to install:

- [Git](https://git-scm.com/install/)
- [mise-en-place](https://mise.jdx.dev/getting-started.html)

Then proceed to setup:

```bash
# clone the repository
git clone --recursive https://github.com/learnett/desktop learnet-desktop
cd learnet-desktop

# Install tools from mise
mise install

# install all packages
mise install:frozen

# start the application
mise dev
# ... or build the bundle
mise build
# ... or build all distributables
mise make
```

Various useful commands for development testing:

```bash
# connect to the development server
mise exec -- pnpm start -- --force-server http://localhost:5173

# test the flatpak (after `make`)
mise exec -- pnpm install:flatpak
mise exec -- pnpm run:flatpak
# ... also connect to dev server like so:
mise exec -- pnpm run:flatpak --force-server http://localhost:5173

# Nix-specific instructions for testing
pnpm package
pnpm run:nix
# ... as before:
pnpm run:nix --force-server=http://localhost:5173
# a better solution would be telling
# Electron Forge where system Electron is
```

### Pulling in Learnet's assets

If you want to pull in Learnet brand assets after pulling, run the following:

```bash
# update the assets
mise assets
```

Currently, this is required to build, any forks are expected to provide their own assets.
