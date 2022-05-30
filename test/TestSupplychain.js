const { expect, assert } = require("chai")
const { ethers } = require("hardhat")

describe("SupplyChain", function () {
    const SupplyChain = await ethers.getContractFactory("SupplyChain")
    const supplyChain = await SupplyChain.deploy()
    await supplyChain.deployed()

    const State = {
        Harvested: 0,
        Processed: 1,
        Packed: 2,
        ForSale: 3,
        Sold: 4,
        Shipped: 5,
        Received: 6,
        Purchased: 7
    }

    const [owner,
        farmer,
        distributor,
        retailer,
        consumer
    ] = await ethers.getSigners()

    var sku = 1
    var upc = 1
    const ownerID = owner
    const originFarmerID = farmer
    const originFarmName = "Ahmad Musa"
    const originFarmMetadata = "Jalingo"
    const originFarmLatitude = "8.8929"
    const originFarmLongitude = "11.3771"
    // var productID = sku + upc;
    const productNotes = "Yam Rice Cassava";
    const productPrice = ethers.utils.formatEther(1)
    var itemState = 0
    const distributorID = distributor
    const retailerID = retailer
    const consumerID = consumer
    const emptyAddress = '0x00000000000000000000000000000000000000';

    it("Should simulate a famer: havesting, processing, and packaging", async function () {
        let eventEmitted = false

        supplyChain.Harvested(() => {
            eventEmitted = true;
        });

        await supplyChain.connect(farmer).harvestItem(
            originFarmName,
            originFarmMetadata,
            originFarmLatitude,
            originFarmLongitude,
            productMetadata,
            productPrice
        );

        eventEmitted = true

        const resultBufferThree = await supplyChain.fetchItemBufferThree(upc)
        console.log(resultBufferThree[5])
        expect(resultBufferThree[5]).not.throw()
    })

    
})