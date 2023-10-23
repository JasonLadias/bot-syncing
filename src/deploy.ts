import dotenv from 'dotenv';
dotenv.config({path: '../.env'});
import { ethers } from 'ethers';

import PingPong from './abi/PingPong'

const provider = new ethers.InfuraProvider('goerli', process.env.INFURA_API_KEY!);
const wallet = new ethers.Wallet(process.env.DEPLOY_PRIVATE_KEY!, provider);

const newContractInstance = new ethers.ContractFactory(
  PingPong.abi,
  PingPong.bytecode,
  wallet
);

const deploy = async () => {
  console.log('Deploying contract...')
  const contract = await newContractInstance.deploy();

  const contractAddress = await contract.getAddress();
  console.log(`Contract address: ${contractAddress}`);
  await contract.deploymentTransaction()?.wait();
  console.log(`Contract deployed at address: ${contractAddress}`);
}


deploy().catch(console.error);
