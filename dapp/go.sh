#!/usr/bin/env zsh
#
# Zsh command-line helpers for Tezos dApp development.
#
# All the salient commands to build Memory are included here for reference.
#
# Author: Edward Garson <edward@ecadlabs.com>

install_packages() {
    npm install @taquito/taquito
    npm install @taquito/beacon-wallet
    npm install @airgap/beacon-sdk
}

install_global_packages() {
    npm install -g typescript
}

npm_full_cycle() {
    npm run compile
    npm run build  # Build the *bundle*, not *compile*
    npm run start
}
alias nfc=npm_full_cycle

alias nrb='npm run build'
alias nrs='npm run start'
alias nrc='npm run compile'
