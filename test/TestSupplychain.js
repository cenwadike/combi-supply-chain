const { expect, assert } = require("chai");
const { ethers } = require("hardhat");

describe("SupplyChain", async function () {
  it("Should simulate a supplychain parties", async function () {
    const SupplyChain = await ethers.getContractFactory("SupplyChain");
    const supplyChain = await SupplyChain.deploy();
    await supplyChain.deployed();

    const [farmer, distributor, retailer, consumer] = await ethers.getSigners();

    const upc = 1;
    const originFarmerName = "Ahmad Musa";
    const originFarmMetadata = "Jalingo";
    const originFarmLatitude = "8.8929";
    const originFarmLongitude = "11.3771";
    const productMetadata = "Yam Rice Cassava";
    const productPrice = ethers.utils.parseUnits("1", "ether");
    const distributorPrice = ethers.utils.parseUnits("2", "ether");
    const retailPrice = ethers.utils.parseUnits("3", "ether");

    console.log("-------------------------------");
    console.log("SIMULATING SUPPLYCHAIN PARTIES");
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

    let harvestedState = await supplyChain.fetchCurrentState(1);
    expect(harvestedState).to.equal(1);

    /*********************inter step test********** */
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
    } catch (error) {
      console.log(error);
    }
    try {
      await supplyChain.connect(retailer).buyAsRetail(2, retailPrice, { value: distributorPrice });
    } catch (error) {
      console.log(error);
    }
    try {
      await supplyChain.connect(consumer).buyAsConsumer(2, { value: retailPrice });
    } catch (error) {
      console.log(error);
    }

    ////////////////////////////////distributor action
    try {
      await supplyChain
        .connect(distributor)
        .buyAsDist(upc, distributorPrice, { value: productPrice });
    } catch (error) {
      console.log(error);
    }
    const buyAsDistState = await supplyChain.fetchCurrentState(1);
    expect(buyAsDistState).to.equal(2);

    ////////////////////////////////retailer action
    try {
      await supplyChain
        .connect(retailer)
        .buyAsRetail(upc, retailPrice, { value: distributorPrice });
    } catch (error) {
      console.log(error);
    }
    const buyAsRetailState = await supplyChain.fetchCurrentState(1);
    expect(buyAsRetailState).to.equal(5);

    ////////////////////////////////consumer action
    try {
      await supplyChain.connect(consumer).buyAsConsumer(upc, { value: retailPrice });
    } catch (error) {
      console.log(error);
    }
    const buyAsConsumerState = await supplyChain.fetchCurrentState(1);
    expect(buyAsConsumerState).to.equal(7);

    ////////////////////////////////query blockchain
    console.log("-------------------------------");
    console.log("SIMULATING BLOCKCHAIN QUERY");
    console.log("---------------------------------");
    let farmerItems;
    try {
      farmerItems = await supplyChain.connect(farmer).fetchFarmerItems();
    } catch (error) {
      console.log(error);
    }
    console.log("farmer assotiated items:");
    console.log(farmerItems);
    console.log("");

    let distributorItems;
    let itemsAvailableForDistro;
    try {
      distributorItems = await supplyChain.connect(distributor).fetchDistroItems();
    } catch (error) {
      console.log(error);
    }
    console.log("distributor assotiated items:");
    console.log(distributorItems);
    console.log("");
    try {
      itemsAvailableForDistro = await supplyChain
        .connect(distributor)
        .fetchAvailableItemsForDistro();
    } catch (error) {
      console.log(error);
    }
    console.log("Items available to distributors:");
    console.log(itemsAvailableForDistro);
    console.log("");

    let retailerItems;
    let itemsAvailableForRetail;
    try {
      retailerItems = await supplyChain.connect(retailer).fetchRetailerItems();
    } catch (error) {
      console.log(error);
    }
    console.log("retailer assotiated items:");
    console.log(retailerItems);
    console.log("");
    try {
      itemsAvailableForRetail = await supplyChain
        .connect(retailer)
        .fetchAvailableItemsForRetailer();
    } catch (error) {
      console.log(error);
    }
    console.log("Items available to retailers:");
    console.log(itemsAvailableForRetail);
    console.log("");

    let consumerItems;
    let itemsAvailableForConsumers;
    try {
      consumerItems = await supplyChain.connect(consumer).fetchConsumerItems();
    } catch (error) {
      console.log(error);
    }
    console.log("consumer assotiated items:");
    console.log(consumerItems);
    console.log("");
    try {
      itemsAvailableForConsumers = await supplyChain
        .connect(consumer)
        .fetchAvailableItemsForConsumer();
    } catch (error) {
      console.log(error);
    }
    console.log("Items available to consumers");
    console.log(itemsAvailableForConsumers);
    console.log("");

    console.log("-------------------------------");
    console.log("GETTING TRANSACTIOIN HASHES");
    console.log("-------------------------------");
    let itemHashes;
    try {
      itemHashes = await supplyChain.fetchItemHashes(1);
    } catch (error) {
      console.log(error);
    }
    console.log("Hashes:");
    console.log(itemHashes);
    console.log("");
  });
});
