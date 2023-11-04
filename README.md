# README

This project is a full-stack Taquito-based Tezos dApp that uses a custom Smart Contract that implements a simple memory game.

# Contents

These are the most important files in this project:

├── dapp                  # The Front End: TypeScript, HTML5, CSS

├── go.sh                 # Any and every command used to produce this project (install, compile, build, ...)

├── LICENSE               # Legalese

├── README.md             # You are reading this now

├── scs                   # The Tezos Smart Contract / Blockchain part

│   └── contracts         #   The actual contracts themselves Tezos Smart Contracts (CameLIGO)

│   └── artifacts         #   Compiled versions of the contracts, for convenience

# Status

This softwareis is in early ALPHA status! Many improvements are forthcoming!!

# Purpose

The purpose of this repo is to show a bare-bones, frameworkless example of using Taquito to interact with a Tezos Smart Contract.

# Look Ma: No Framework!

Yup, you read it correctly: no frameworks were harmed (or even used!) in the production of this project. It is vanilla TypeScript/Taquito, HTML5 and CSS wired up to DOM events.

# Requirements

* A Tezos wallet with some test Tez on GhostNet (Kukai recommended)

## Recommended

* taqueria
* ligo

# How to Run the dApp

```
$ source go.sh     # Get access to handy aliases etc
$ npm run compile  # or, 'nrc' (from go.sh)
$ npm run build    # or, 'nrb'
$ npm run start    # or, 'nrs'
```

Navigate to http://localhost:1234 and you should see the dApp UI. It is very basic!

# How to Play

Each `New Game` is associated with the connected Wallet, so that many players can simultaneously play! So, when you look at the contract's storage, you will see other Wallet's games' storage.

* Press `Connect Wallet` to connect to the MemoryGame dApp and confirm with your wallet
* Press `New Game`

(If you want to cheat, watch the console where the random Game Sequence is logged!)

* Press `Play Turn` (and watch the game carefully)

You start at Level 1. Each round, the computer will add one to the sequence that you have to attempt to guess.

When you have finished clicking your attempt, the dApp sends the attempt to the Smart Contract which updates the storage with the current level and the state (Playing, Won or Lost).

## Game State

* `Playing` indicates that the game is still going (no mistakes!)
* `Lost` indicates that the attempt failed
* `Won` indicates that the final attempt was correct and the game is over

BUG! Currently, the State is not being persisted to Storage correctly!

# Miscellaneous Functionality

* Originate a new copy of the memory contract by clicking `Originate`

Wait for the operation to finish, and then find the new contract address ('KT1...') in the console. This gives you your own contract to play with, although the one that is hardcoded into the dApp will work fine. The difference is that *only you* will be using the new contract (presumably), while the currently-deployed one may have many other players' entries in the contract storage.

TODO: Contract link on ghostnet

# Extension Ideas

* Extend the contract interface with a facility to keep high score by address
* Allow the user to select the length of the game/sequence

## Further Info

## Parameter,Storage List

* When you compile with `ligo`, it auto-creates both `<contract>.{parameter,storage}List.mligo` for you
* These files can be used to selectively test and run the contracts for convenience
