/**
   Simple memory dApp for the `memory.mligo` Smart Contract
*/

import { TezosToolkit } from '@taquito/taquito';
import { BeaconWallet } from '@taquito/beacon-wallet';
import { NetworkType } from '@airgap/beacon-sdk';
import { InMemorySigner } from '@taquito/signer';

declare global {
    interface Window {
        memoryWallet: {
            connect: () => Promise<void>;
            disconnect: () => Promise<void>;
        };
        memoryContract: {
            originate: () => Promise<void>;
            // TODO By type safe(r)!
            load: (contractAddress: string) => Promise<void>;
            newGame: (contractAddress: string) => Promise<void>;
        };
        memoryGameContract: any;
        quadrantClicked: (quadrant: number) => void;
        currentLevel: number;
        gameSequence: number[];
        currentAttempt: number[];
        playTurn: () => void;
    }
}

const rpcUrl = 'https://ghostnet.ecadinfra.com';
const Tezos = new TezosToolkit(rpcUrl);

// ! This secret key is here only for this example ! Use `env.secretKey` everywhere else !
const userAddress = "tz3RtHDw1kC3yRuqLJoeEUNB5NKYrdpLrU57";
const signer = new InMemorySigner("p2sk4DdVHbssdCYKCibscgAYZxmVbTPjp5xrL1NGwAZCKhtzzw1BGV");
Tezos.setSignerProvider(signer);

const wallet = new BeaconWallet({
    name: 'Memory Game',
    preferredNetwork: NetworkType.GHOSTNET,
});
Tezos.setWalletProvider(wallet);

window.memoryWallet = {
    connect: async function() {
        try {
            const activeAccount = await wallet.client.getActiveAccount();
            if (!activeAccount) {
                await wallet.requestPermissions({ network: { type: NetworkType.GHOSTNET } });
            }
            const userAddress = await wallet.getPKH();
            console.log(`Wallet is connected to: ${userAddress}`);
        } catch (error) {
            console.error('Error connecting wallet:', error);
        }
    },
    disconnect: async function() {
        try {
            Tezos.setWalletProvider(undefined);
            console.log('Successfully disconnected wallet');
        } catch (error) {
            console.error('Error disconnecting wallet:', error);
        }
    }
};

import contractJson from './dist/memory.json';
const initialStorage = {};

function generateRandomSequence(length: number): number[] {
    return Array.from({ length }, () => Math.floor(Math.random() * 4) + 1);
}

async function memoryContract(): Promise<any> {
    if (!window.memoryGameContract) {
        // TODO DRY this out decl is also in index.html
        window.memoryGameContract = await Tezos.contract.at('KT1GAg4fcYUKxJwtwVRs2hHjv2zLXNfTxdrN');
    }
    return window.memoryGameContract;
}

async function flashQuadrant(quadrantId: number) {
    const quadrant = document.getElementById(`quadrant-${quadrantId}`);
    if (quadrant) {
        console.log(`Got quadrant quadrant-${quadrantId}`);
        quadrant.classList.add('active');
        await new Promise(resolve => setTimeout(resolve, 500));
        quadrant.classList.remove('active');
    } else {
        console.error(`Couldn't find "quadrant-${quadrantId}"`);
    }
}

async function playSequence(sequence: number[], level: number) {
    for (let i = 0; i < level; i++) {
        flashQuadrant(sequence[i]);
        await new Promise(resolve => setTimeout(resolve, 600));
    }
}

function updateLevelLabel(level: number) {
    const label = document.getElementById('level-label');
    if (label) {
        label.textContent = `Level: ${window.currentLevel}`;
    }
}

window.playTurn = function() {
    if (window.currentLevel++ > window.gameSequence.length) {
        window.currentLevel = 1;
    }
    updateLevelLabel(window.currentLevel);
    console.log(`Playing turn ${window.currentLevel}`);
    playSequence(window.gameSequence, window.currentLevel);
}

window.quadrantClicked = function(quadrant: number) {
    console.log(`Quadrant ${quadrant} clicked`);
    // Add the clicked quadrant to the array
    window.currentAttempt.push(quadrant);
    if (window.currentAttempt.length == window.currentLevel) {
        // Send the array to the contract
        console.log(`Sending attempt ${window.currentAttempt} to contract`);
        memoryContract().then(async (contract) => {
            const operation = await contract.methods
                .play_turn(userAddress, window.currentAttempt).send();
            await operation.confirmation();
            const storage: Map<string,any> = await contract.storage();
            const game_state = storage.get(userAddress);
            console.log('Status:', game_state.status);
            //if (game_state.status.toNumber() == 2) { // TODO Don't use magic number
            //    console.log('Lost!');
            //}
        });
        window.currentAttempt = [];
    }
}

window.memoryContract = {
    originate: async function() {
        try {
            console.log('Origination in progress...');
            const originationOp = await Tezos.contract.originate({
                code: contractJson,
                storage: initialStorage,
            });
            await originationOp.confirmation(1);
            const contractAddress = originationOp.contractAddress;
            console.log(`Contract deployed at: ${contractAddress}`);
        } catch (error) {
            console.error('Error originating contract:', error);
        }
    },
    load: async function(contractAddress) {
        try {
            if (!window.memoryGameContract) {
                window.memoryGameContract = await Tezos.contract.at(contractAddress);
            }
            const contract = window.memoryGameContract;
            console.log(`MemoryGame contract ${contractAddress} loaded...`);
        } catch (error) {
            console.error('Error loading contract:', error);
        }
    },
    newGame: async function(contractAddress) {
        try {
            if (!window.memoryGameContract) {
                window.memoryGameContract = await Tezos.contract.at(contractAddress);
            }
            const contract = window.memoryGameContract;
            // TODO Parameterize sequence length
            window.gameSequence = generateRandomSequence(5);
            window.currentLevel = 0;
            window.currentAttempt = [];
            const operation = await contract.methods
                .init_new_game(userAddress, window.gameSequence).send();
            await operation.confirmation();
            const storage: Map<string,any> = await contract.storage();
            const game_state = storage.get(userAddress);
            if (game_state) {
                // Read from storage here; translate from BigNumber to number for console output
                console.log('Sequence (Shh!):', game_state.sequence.map((n:any) => n.toNumber()));
            } else {
                console.error(`No game found for ${userAddress}...`);
            }
        } catch (error) {
            console.error('Error in init_new_game:', error);
        }
    }
}
