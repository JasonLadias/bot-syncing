import dotenv from "dotenv";
dotenv.config({ path: "../.env" });
import { ethers } from "ethers";

import PingPong from "./abi/PingPong";

const provider = new ethers.InfuraProvider(
  "goerli",
  process.env.INFURA_API_KEY!
);
const wallet = new ethers.Wallet(process.env.DEPLOY_PRIVATE_KEY!, provider);
const deployedContractAddress = process.env.DEPLOYED_CONTRACT_ADDRESS!;

const contractInstance = new ethers.Contract(
  deployedContractAddress,
  PingPong.abi,
  wallet
);

const emitPing = async () => {
  console.log("Sending Ping...");
  const response = await contractInstance.ping();
  console.log("Ping sent! Waiting for transaction to be mined...");
  await response.wait();
  console.log(`Ping sent!`);
};

emitPing().catch(console.error);
