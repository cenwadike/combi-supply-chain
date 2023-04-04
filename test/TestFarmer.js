const { expect, assert } = require("chai");
const { ethers } = require("hardhat");

describe("SupplyChain", async function () {
  it("Should simulate a supplychain parties", async function () {
    // deploy contract
    const SupplyChain = await ethers.getContractFactory("SupplyChain");
    const supplyChain = await SupplyChain.deploy();
    await supplyChain.deployed();

    const [farmer] = await ethers.getSigners();

    const originFarmerName = "Ahmad Musa";
    const originFarmMetadata = "Jalingo";
    const originFarmLatitude = "8.8929";
    const originFarmLongitude = "11.3771";
    const productMetadata = "Yam Rice Cassava";
    const productPrice = ethers.utils.parseUnits("1", "ether");

    console.log("-------------------------------");
    console.log("SIMULATING SUPPLYCHAIN PARTIES: FARMER");
    console.log("-------------------------------");

    ////////////////////////////////farmer action
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
    const state = await supplyChain.fetchCurrentState(1);
    expect(state).to.equal(1);
  });
});
