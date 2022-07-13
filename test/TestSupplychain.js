const { expect, assert } = require("chai");
const { ethers } = require("hardhat");

describe("SupplyChain", async function () {
  it("Should simulate a supplychain parties", async function () {
    const SupplyChain = await ethers.getContractFactory("SupplyChain");
    const supplyChain = await SupplyChain.deploy();
    await supplyChain.deployed();

    const [owner, farmer, distributor, retailer, consumer] = await ethers.getSigners();

    const upc = 1;
    const originFarmerName = "Ahmad Musa";
    const originFarmMetadata = "Jalingo";
    const originFarmLatitude = "8.8929";
    const originFarmLongitude = "11.3771";
    const productMetadata = "Yam Rice Cassava";
    const productPrice = ethers.utils.parseUnits("1", "ether");
    const distributorPrice = ethers.utils.parseUnits("2", "ether");
    const retailPrice = ethers.utils.parseUnits("3", "ether");

    console.log("Simulating Supplychain parties");
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

    const harvestedState = await supplyChain.fetchCurrentState(1);
    // expect(harvestedState == 1);
    console.log("Product state: ", harvestedState);
    console.log("Product harvested and on sale");
    console.log("-------------------------------");

    ////////////////////////////////distributor action
    try {
      await supplyChain
        .connect(distributor)
        .buyAsDist(upc, distributorPrice, { value: productPrice });
    } catch (error) {
      console.log(error);
    }
    const buyAsDistState = await supplyChain.fetchCurrentState(1);
    // expect(buyAsDistState == 2);
    console.log("Product state: ", buyAsDistState);
    console.log("Product is sold to distributor and on sale to retailer");
    console.log("-------------------------------");

    ////////////////////////////////retailer action
    try {
      await supplyChain
        .connect(retailer)
        .buyAsRetail(upc, retailPrice, { value: distributorPrice });
    } catch (error) {
      console.log(error);
    }
    const buyAsRetailState = await supplyChain.fetchCurrentState(1);
    // expect(buyAsRetailState == 5);
    console.log("Product state: ", buyAsRetailState);
    console.log("Product is sold, shipped and received by retailer and on sale to consumer");
    console.log("-------------------------------");

    ////////////////////////////////consumer action
    try {
      await supplyChain.connect(consumer).buyAsConsumer(upc, { value: retailPrice });
    } catch (error) {
      console.log(error);
    }
    const buyAsConsumerState = await supplyChain.fetchCurrentState(1);
    // expect(buyAsRetailState == 7);
    console.log("Product state: ", buyAsConsumerState);
    console.log("Product bought by customer");
  });
});
