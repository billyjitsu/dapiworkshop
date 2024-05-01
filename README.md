# Read and API3 dAPI Price feed to your contract

This project covers two topics.
- How to get your smart contract to read a price feed from a proxy available from  https://market.api3.org/dapis
- How to deploy an adaptor to utilize API3 dAPIs without having to refactor your code if you use another library.

### Files

- `API3PriceFeed.sol` - Base contract setup to receive an API3 price feed
- `OtherOracle.sol` - Simple contract that receives other popular oracles in their native format
- `Adaptor.sol` - The adaptor contract the converts the API3 price feed data to match the format that is required by the other oracle contract.

- `Mock Folders` - Contracts that just return fake data in API3 oracle format and AggregatorV3 format

### How to Execute a Price Feed Read

Deploy the API3PriceFeed.sol contract.  Once deployed, you want to choose the price feed you want to read in your contract by going to https://market.api3.org/dapis

Call the `setProxyAddress` with the address for the price feed.  You can then read the data by calling `readDataFeed`

### How to use the adaptor

Deploy 




```shell
npx hardhat help
npx hardhat test
REPORT_GAS=true npx hardhat test
npx hardhat node
npx hardhat ignition deploy ./ignition/modules/Lock.js
```
