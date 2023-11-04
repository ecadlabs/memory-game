#!/usr/bin/env zsh
#
# Zsh command-line helpers for the Smart Contract side of the Memory game.
#

_compile_contract() { taq compile $1; }
_run_tests_taq() { taq test $1 --plugin @taqueria/plugin-ligo; }
_run_tests_ligo() { ligo run test $1; }

compile_contracts() {
    _compile_contract memory.mligo
}
alias ccs=compile_contracts

# Taqueria looks for contracts in `contracts/`
run_tests_taq() {
    _run_tests_taq memory.test.mligo
}
alias rtt=run_tests_taq

# Substantially faster than `run_tests_taq` but not as pretty; notice full path req'd
run_tests_ligo() {
    _run_tests_ligo contracts/memory.test.mligo
}
alias rtl=run_tests_ligo

install_plugins() {
    taq install @taqueria/plugin-ligo
    taq install @taqueria/plugin-taquito
}
