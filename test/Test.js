const {
  time,
  loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");

describe("dAPI", function () {
  async function deployBefore() {
    // Set the price we are expecting to get from the DAPI
    // For ease I'm making ETH work 1000 USD, you can change this price but will reflect the amount of tokens you recieve
    const price = ethers.parseEther("1000");
    // We get the current time from Hardhat Network
    const timestamp = await time.latest();

    // Contracts are deployed using the first signer/account by default
    const [owner, otherAccount] = await ethers.getSigners();

    const MockDapi = await ethers.getContractFactory("MockDapiProxy");
    const mockDapi = await MockDapi.deploy();
    await mockDapi.waitForDeployment();

    //Set our mock values for the dAPI to return
    //We can't call oracles on local node, so we are making our own
    await mockDapi.setDapiValues(price, timestamp);

    const API3Oracle = await ethers.getContractFactory("API3PriceFeed");
    const api3oracle = await API3Oracle.deploy();
    await api3oracle.waitForDeployment();

    //Set our mock Proxy address that will return static values
    await api3oracle.setProxyAddress(mockDapi.getAddress());

    const OtherOracle = await ethers.getContractFactory("DataConsumerV3");
    const otherOracle = await OtherOracle.deploy();
    await otherOracle.waitForDeployment();

    return { api3oracle, otherOracle, owner, otherAccount };
  }

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      const { api3oracle, owner } = await loadFixture(deployBefore);
      expect(await api3oracle.owner()).to.equal(owner.address);
    });
  });

  describe("Set Price Feed", function () {
    it("Only we can set the price feed", async function () {
      const { api3oracle, owner, otherAccount } = await loadFixture(deployBefore);
      await expect(
        api3oracle
          .connect(otherAccount)
          .setProxyAddress("0x13d1Ed8c24911d88e6155cE32A66908399C97924")
      ).to.be.revertedWith("Ownable: caller is not the owner");
      await api3oracle.setProxyAddress(
        "0x13d1Ed8c24911d88e6155cE32A66908399C97924"
      );
    });
  });

  xdescribe("Deposit", function () {
    it("Deposit Eth", async function () {
      const { api3oracle, owner } = await loadFixture(deployBefore);

      let [price, time] = await api3oracle.readDataFeed();
      //verify our mock values are set
      // console.log("Price: ", price.toString());
      // console.log("Time: ", time.toString());
      //Deposit 1 ETH to recieve tokens
      await api3oracle.depositCollateral({ value: ethers.parseEther("1") });
      //Make sure we get our tokens in return **NOTE: This is hardcoded to 1000 tokens per ETH for this example**
      await expect(await api3oracle.balanceOf(owner.address)).to.be.equal(
        ethers.parseEther("1000")
      );

      //Make sure we can't deposit 0 ETH                               //CUSTOM ERRORS GET CHECKED LIKE THIS (contract instance, custom error name)
      await expect(
        api3oracle.depositCollateral({ value: ethers.parseEther("0") })
      ).to.be.revertedWithCustomError(api3oracle, "NoValue");
    });
  });

  xdescribe("Reclaim ETH", function () {
    it("Reclaim Collateral", async function () {
      const { api3oracle, owner } = await loadFixture(deployBefore);
      // console logging the eth balances of the owner (not including account abstraction here)
      //  console.log("Balance: ", await ethers.provider.getBalance(owner.address));

      // First deposit to recieve tokens
      await api3oracle.depositCollateral({ value: ethers.parseEther("1") });
      //   Our balance of ETH should be 1 ETH less now
      //   console.log("Balance: ", await ethers.provider.getBalance(owner.address));

      // Because we hardcoded the price, I'm approving 1000 tokens specifically
      await api3oracle.approve(api3oracle.getAddress(), ethers.parseEther("1000"));
      //Reclaim our ETH
      await api3oracle.reclaimEth(ethers.parseEther("1000"));
      //   console.log("Balance: ", await ethers.provider.getBalance(owner.address));

      // Try to spend more than I got
      await api3oracle.approve(api3oracle.getAddress(), ethers.parseEther("1000"));
      await expect(
        api3oracle.reclaimEth(ethers.parseEther("1000"))
      ).to.be.revertedWith("ERC20: burn amount exceeds balance");
    });
  });

  
});
