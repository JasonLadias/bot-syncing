"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config({ path: '../.env' });
const ethers_1 = require("ethers");
const provider = new ethers_1.ethers.InfuraProvider('goerli', process.env.INFURA_API_KEY);
const wallet = new ethers_1.ethers.Wallet(process.env.PRIVATE_KEY, provider);
const contractAddress = process.env.DEPLOYED_CONTRACT_ADDRESS;
const startBlock = 8825904;
const contractAbi = [
    "event Ping()",
    "function pong(bytes32 _txHash) external"
];
const contract = new ethers_1.ethers.Contract(contractAddress, contractAbi, wallet);
const main = async () => {
    // Store the last processed block to ensure we don't process the same event twice
    let lastProcessedBlock = startBlock;
    console.log(`Last processed block: ${lastProcessedBlock}`);
    // Event listener for Ping events
    contract.on('Ping', async () => {
        console.log('Ping event received');
        // Fetch the current block number
        const blockNumber = await provider.getBlockNumber();
        // Check if this event is new since the last one we processed
        if (blockNumber > lastProcessedBlock) {
            try {
                // Call the 'pong' function on the contract, passing the hash of 'Ping'
                const tx = await contract.pong(ethers_1.ethers.hashMessage('Ping'));
                // Wait for the transaction to be mined
                await tx.wait();
                console.log(`Pong sent for Ping at block ${blockNumber}`);
                lastProcessedBlock = blockNumber;
            }
            catch (error) {
                console.error(`Error sending Pong: ${error.message}`);
            }
        }
    });
    console.log('Bot is running...');
};
main().catch(console.error);
