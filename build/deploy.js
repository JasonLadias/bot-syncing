"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config({ path: '../.env' });
const ethers_1 = require("ethers");
const PingPong_1 = __importDefault(require("./abi/PingPong"));
const provider = new ethers_1.ethers.InfuraProvider('goerli', process.env.INFURA_API_KEY);
const wallet = new ethers_1.ethers.Wallet(process.env.DEPLOY_PRIVATE_KEY, provider);
const newContractInstance = new ethers_1.ethers.ContractFactory(PingPong_1.default.abi, PingPong_1.default.bytecode, wallet);
const deploy = async () => {
    console.log('Deploying contract...');
    const contract = await newContractInstance.deploy();
    const contractAddress = await contract.getAddress();
    console.log(`Contract address: ${contractAddress}`);
    await contract.deploymentTransaction()?.wait();
    console.log(`Contract deployed at address: ${contractAddress}`);
};
deploy().catch(console.error);
