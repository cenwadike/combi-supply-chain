const { expect, assert } = require("chai");
const { ethers } = require("hardhat");

describe("SupplyChain", async function () {
  it("Should simulate a supplychain distributor", async function () {
    // deploy contract
    const SupplyChain = await ethers.getContractFactory("SupplyChain");
    const supplyChain = await SupplyChain.deploy();
    await supplyChain.deployed();

    const [farmer, distributor, retailer] = await ethers.getSigners();

    const originFarmerName = "Ahmad Musa";
    const originFarmMetadata = "Jalingo";
    const originFarmLatitude = "8.8929";
    const originFarmLongitude = "11.3771";
    const productMetadata = "Yam Rice Cassava";
    const productPrice = ethers.utils.parseUnits("1", "ether");
    const distributorPrice = ethers.utils.parseUnits("2", "ether");

    console.log("-------------------------------");
    console.log("SIMULATING SUPPLYCHAIN PARTIES: DISTRIBUTOR");
    console.log("-------------------------------");

    /********************* buy directly from distributor ********** */
    try {
      await supplyChain
        .connect(farmer)
        .harvestItem(
          originFarmerName,
          originFarmMetadata,
          originFarmLatitude,
          originFarmLongitude,
          productMetadata,
          productPrice
        );
    } catch (error) {
      console.log(error);
    }
    try {
      await supplyChain
        .connect(distributor)
        .buyAsDist(1, distributorPrice, { value: productPrice });

      let state = await supplyChain.fetchCurrentState(1);
      expect(state).to.equal(2);
    } catch (error) {
      console.log(error);
    }
  });
});
