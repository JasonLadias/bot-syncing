import { ethers } from "ethers";
import { queueManager } from "./queueManager";
import { ethereumService } from "./ethereumService";
import { config } from "./config";

// Load environment variables
// Validate required environment variables
if (
  !config.infuraApiKey ||
  !config.privateKey ||
  !config.deployedContractAddress ||
  !config.network ||
  isNaN(config.startBlock)
) {
  console.error("Error: Missing required environment variables.");
  process.exit(1);
}

/**
 * This method checks for any Ping events that were missed while the bot was not running.
 */
const checkFailedPings = async () => {
  try {
    await ethereumService.enqueuePongsToSend(config.startBlock);
  } catch (error) {
    console.error("Error in checkFailedPings:", error);
  }
}

/** 
 * This method processes the first element in the queue.
 */
const processPingQueue = async () => {
  const pingEvent = queueManager.peekFirst();
  if (!pingEvent) {
    console.log("queue is empty right now");
    return;
  }
  try {
    console.log("Attempting to send Pong...")
    // Attempt to send a Pong transaction
    // If gasPrice is defined on the pingEvent, use it for the transaction
    const tx = await ethereumService.sendPong(
      ethers.hashMessage("Ping"),
      pingEvent.gasPrice
    );

    console.log(
      `Pong sent and confirmed for Ping at block ${pingEvent.blockNumber}`
    );
    // Remove the Ping event from the queue since it was successfully processed
    queueManager.dequeue();
    queueManager.printQueue();
  } catch (error) {
    console.error(
      `Error sending Pong for Ping at block ${pingEvent.blockNumber}:`,
      error
    );
    // If the transaction failed, double the gas price for the next attempt
    if (pingEvent.gasPrice) {
      pingEvent.gasPrice = pingEvent.gasPrice * 2n;
    } else {
      // If gas price is not set, get the current gas price and set it on the pingEvent
      pingEvent.gasPrice = await ethereumService.getGasPrice();
    }
  }
};

const main = async (): Promise<void> => {
  try {
    // Check for existing Ping events when the program was not running
    await checkFailedPings();
    // Event listener for Ping events
    ethereumService.listenToPingEvents();

    console.log("Bot is running...");
  } catch (error) {
    console.error("Error in main:", error);
    process.exit(1);
  }
};

// Set up setInterval to run the processPingQueue function every minute
setInterval(processPingQueue, 60 * 1000);

// Set up setInterval to run the checkFailedPings function every 10 minutes
setInterval(async () => {
  console.log("Checking for failed Pings...");
  await checkFailedPings();
}, 10 * 60 * 1000)

// Run the bot and handle any uncaught errors
main();
