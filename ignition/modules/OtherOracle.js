const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("Deploy", (m) => {

  const ETHUSD = "0x694AA1769357215DE4FAC081bf1f309aDC325306"; // Chainlink ETH/USD Sepolia

  const DataConsumerV3 = m.contract("DataConsumerV3", [ETHUSD]);

  return { DataConsumerV3 };
});
