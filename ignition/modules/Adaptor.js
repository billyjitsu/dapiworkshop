const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("Deploy", (m) => {

  const ETHUSD = "0x3E339a9B00AEA77Ae39B36CF6c1E0C8a2899E101";

  const Api3AggregatorAdaptor = m.contract("Api3AggregatorAdaptor", [ETHUSD]);

  return { Api3AggregatorAdaptor };
});
