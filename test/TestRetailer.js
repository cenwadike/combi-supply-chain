const { expect, assert } = require("chai");
const { ethers } = require("hardhat");

describe("SupplyChain", async function () {
  it("Should simulate a supplychain parties", async function () {
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
    const retailPrice = ethers.utils.parseUnits("3", "ether");

    console.log("-------------------------------");
    console.log("SIMULATING SUPPLYCHAIN PARTIES: RETAILER");
    console.log("-------------------------------");

    /********************* buy directly from farmer ********** */
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
    } finally {
      await supplyChain.connect(retailer).buyAsRetail(1, retailPrice, { value: productPrice });
      let state = await supplyChain.fetchCurrentState(1);
      expect(state).to.equal(5);
    }

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
        .buyAsDist(2, distributorPrice, { value: productPrice });

      let state = await supplyChain.fetchCurrentState(2);
      expect(state).to.equal(2);
    } catch (error) {
      console.log(error);
    }
    try {
      await supplyChain.connect(retailer).buyAsRetail(2, retailPrice, { value: distributorPrice });
      let state = await supplyChain.fetchCurrentState(2);
      expect(state).to.equal(5);
    } catch (error) {
      console.log(error);
    }
  });
});
