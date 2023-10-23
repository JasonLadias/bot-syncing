"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const ethers_1 = require("ethers");
const helpers_1 = require("./helpers");
const PingPong_1 = __importDefault(require("./abi/PingPong"));
// Load environment variables
dotenv_1.default.config({ path: "../.env" });
// Validate required environment variables
const INFURA_API_KEY = process.env.INFURA_API_KEY;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const DEPLOYED_CONTRACT_ADDRESS = process.env.DEPLOYED_CONTRACT_ADDRESS;
const NETWORK = process.env.NETWORK;
const START_BLOCK = process.env.START_BLOCK;
if (!INFURA_API_KEY ||
    !PRIVATE_KEY ||
    !DEPLOYED_CONTRACT_ADDRESS ||
    !NETWORK ||
    !START_BLOCK ||
    isNaN(parseInt(START_BLOCK))) {
    console.error("Error: Missing required environment variables.");
    process.exit(1);
}
const startBlock = parseInt(START_BLOCK);
// Setup Ethereum provider and wallet
const provider = new ethers_1.ethers.InfuraProvider(NETWORK, INFURA_API_KEY);
const wallet = new ethers_1.ethers.Wallet(PRIVATE_KEY, provider);
const specifiedAddress = wallet.address;
// Define contract ABI and
const contractAddress = process.env.DEPLOYED_CONTRACT_ADDRESS;
// Create contract instance
const contract = new ethers_1.ethers.Contract(contractAddress, PingPong_1.default.abi, wallet);
const checkExistingPings = async () => {
    try {
        // Get the filter for Ping events
        const pingFilter = contract.filters.Ping();
        // Get all Ping events after the specified block
        const pingEvents = await contract.queryFilter(pingFilter, startBlock);
        console.log(`Number of Ping events after block ${startBlock}: ${pingEvents.length}`);
        // Get the filter for Pong events
        const pongFilter = contract.filters.Pong();
        // Get all Pong events from the specified address after the specified block
        const pongEvents = await contract.queryFilter(pongFilter, startBlock);
        // Filter Pong events by the sender's address
        const pongEventsFromSpecifiedAddress = [];
        for (const event of pongEvents) {
            const transaction = await provider.getTransaction(event.transactionHash);
            if (!transaction)
                continue;
            if (transaction.from.toLowerCase() === specifiedAddress.toLowerCase()) {
                pongEventsFromSpecifiedAddress.push(event);
            }
        }
        const pings = pingEvents.length;
        const pongs = pongEventsFromSpecifiedAddress.length;
        const pongsToSend = pings - pongs;
        if (pongsToSend > 0) {
            console.log(`Sending ${pongsToSend} Pong transactions...`);
            for (let i = 0; i < pongsToSend; i++) {
                const tx = await (0, helpers_1.postWithRetry)(() => contract.pong(ethers_1.ethers.hashMessage("Ping")));
                console.log(`Pong transaction sent: ${tx.hash}`);
                await tx.wait();
                console.log(`Pong transaction confirmed: ${tx.hash}`);
            }
        }
    }
    catch (error) {
        console.error("Error in checkExistingPings:", error);
    }
};
const main = async () => {
    try {
        await checkExistingPings();
        //Store the last processed block to ensure we don't process the same event twice
        let lastProcessedBlock = startBlock;
        console.log(`Last processed block: ${lastProcessedBlock}`);
        // Event listener for Ping events
        contract.on("Ping", async () => {
            console.log("Ping event received");
            // Fetch the current block number
            const blockNumber = await provider.getBlockNumber();
            // Check if this event is new since the last one we processed
            if (blockNumber > lastProcessedBlock) {
                try {
                    // Call the 'pong' function on the contract, passing the hash of 'Ping'
                    const tx = await (0, helpers_1.postWithRetry)(() => contract.pong(ethers_1.ethers.hashMessage("Ping")));
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
        console.log("Bot is running...");
    }
    catch (error) {
        console.error("Error in main:", error);
        process.exit(1);
    }
};
// Run the bot and handle any uncaught errors
main();
