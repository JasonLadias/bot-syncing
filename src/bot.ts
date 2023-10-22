import dotenv from 'dotenv';
dotenv.config({path: '../.env'});
import { ethers } from 'ethers';

const provider = new ethers.InfuraProvider('goerli', process.env.INFURA_API_KEY!);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY!, provider);
const contractAddress = process.env.CONTRACT_ADDRESS!;
const startBlock = 9911056;

const contractAbi = [
  "event Ping()",
  "function pong(bytes32 _txHash) external"
];

const contract = new ethers.Contract(contractAddress, contractAbi, wallet);

const main = async(): Promise<void> => {
    // Store the last processed block to ensure we don't process the same event twice
  let lastProcessedBlock = startBlock;

  // Event listener for Ping events
  contract.on('Ping', async () => {
    // Fetch the current block number
    const blockNumber = await provider.getBlockNumber();
    
    // Check if this event is new since the last one we processed
    if (blockNumber > lastProcessedBlock) {
      try {
        // Call the 'pong' function on the contract, passing the hash of 'Ping'
        const tx = await contract.pong(ethers.hashMessage('Ping'));
        // Wait for the transaction to be mined
        await tx.wait();
        console.log(`Pong sent for Ping at block ${blockNumber}`);
        lastProcessedBlock = blockNumber;
      } catch (error) {
        console.error(`Error sending Pong: ${(error as Error).message}`);
      }
    }
  });

  console.log('Bot is running...');
}

main().catch(console.error);
