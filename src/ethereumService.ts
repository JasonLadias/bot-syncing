import { EventLog, Log, ethers } from "ethers";
import { config } from "./config";
import { queueManager } from "./queueManager";
import PingPong from "./abi/PingPong";
import { postWithRetry } from "./helpers";

class EthereumService {
  private provider: ethers.InfuraProvider;
  private wallet: ethers.Wallet;
  private contract: ethers.Contract;

  constructor() {
    this.provider = new ethers.InfuraProvider(
      config.network,
      config.infuraApiKey
    );
    this.wallet = new ethers.Wallet(config.privateKey, this.provider);
    this.contract = new ethers.Contract(
      config.deployedContractAddress,
      PingPong.abi,
      this.wallet
    );
  }

  public async getPingEvents(startBlock: number): Promise<any> {
    try {
      const pingFilter = this.contract.filters.Ping();
      return await this.contract.queryFilter(pingFilter, startBlock);
    } catch (error) {
      console.error("Error fetching Ping events:", error);
      return [];
    }
  }

  public async getPongEvents(startBlock: number): Promise<any> {
    try {
      const pongFilter = this.contract.filters.Pong();
      const pongEvents = await this.contract.queryFilter(
        pongFilter,
        startBlock
      );

      const filteredPongEvents: EventLog | Log[] = []

      pongEvents.forEach(
        async (event) => {
          const transaction = await this.provider.getTransaction(
            event.transactionHash
          );
          if (transaction?.from.toLowerCase() === this.wallet.address.toLowerCase()) {
            filteredPongEvents.push(event)
            return true;
          }
        }
      );

      return filteredPongEvents;
    } catch (error) {
      console.error("Error fetching Pong events:", error);
      return [];
    }
  }

  public async enqueuePongsToSend(startBlock: number): Promise<void> {
    try {
      const pingEvents = await this.getPingEvents(startBlock);
      const pongEvents = await this.getPongEvents(startBlock);
      const pings = pingEvents.length;
      const pongs = pongEvents.length;
      let pongsToSend = pings - pongs;
      if (pongsToSend > 0) {
        for (let i = pingEvents.length - 1; i >= 0 && pongsToSend > 0; i--, pongsToSend--) {
          queueManager.enqueue({ blockNumber: pingEvents[i].blockNumber });
          console.log(`Ping event added to queue: ${pingEvents[i].blockNumber}`);
        }
      }
    } catch (error) {
      console.error("Error in enqueuePongsToSend:", error);
    }
  }

  public async sendPong(
    hashMessage: string,
    gasPrice?: bigint
  ): Promise<ethers.ContractTransaction> {
    try {
      const tx = await postWithRetry(() =>
        this.contract.pong(hashMessage, { gasPrice })
      );
      await tx.wait();
      return tx;
    } catch (error) {
      console.error("Error in sendPong:", error);
      throw error;
    }
  }

  public async listenToPingEvents(): Promise<void> {
    this.contract.on("Ping", async () => {
      try {
        console.log("Ping event received");

        // Fetch the current block number
        const blockNumber = await this.provider.getBlockNumber();

        // Add the event to the queue
        queueManager.enqueue({ blockNumber });
        console.log(`Ping event added to queue: ${blockNumber}`);
      } catch (error) {
        console.error("Error handling Ping event:", error);
      }
    });
  }

  public async getGasPrice(): Promise<bigint> {
    const feeData = await this.provider.getFeeData();
    return feeData.gasPrice ? BigInt(feeData.gasPrice.toString()) : 1n;
  }
}

export const ethereumService = new EthereumService();
