"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config({ path: "../.env" });
const ethers_1 = require("ethers");
const PingPong_1 = __importDefault(require("./abi/PingPong"));
const provider = new ethers_1.ethers.InfuraProvider("goerli", process.env.INFURA_API_KEY);
const wallet = new ethers_1.ethers.Wallet(process.env.DEPLOY_PRIVATE_KEY, provider);
const deployedContractAddress = process.env.DEPLOYED_CONTRACT_ADDRESS;
const contractInstance = new ethers_1.ethers.Contract(deployedContractAddress, PingPong_1.default.abi, wallet);
const emitPing = async () => {
    console.log("Sending Ping...");
    const response = await contractInstance.ping();
    console.log("Ping sent! Waiting for transaction to be mined...");
    await response.wait();
    console.log(`Ping sent!`);
};
emitPing().catch(console.error);
