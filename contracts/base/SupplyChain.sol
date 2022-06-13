// SPDX-License-Identifier: UNLICENCED

pragma solidity ^0.4.24;
pragma experimental ABIEncoderV2;

import "../accesscontrol/FarmerRole.sol";
import "../accesscontrol/DistributorRole.sol";
import "../accesscontrol/RetailerRole.sol";
import "../accesscontrol/ConsumerRole.sol";
import "../core/Ownable.sol";

contract SupplyChain is
    FarmerRole,
    DistributorRole,
    RetailerRole,
    ConsumerRole
{
    ////////////////////////////////DATA
    address public owner;

    uint public upc;
    uint public sku;

    enum State {
        Harvested,
        Processed,
        Packaged,
        ForSale,
        SoldToDist,
        SoldToRetail,
        SoldToConsumer,
        Shipped,
        Received,
        Purchased
    }

    State public constant DEFAULT_STATE = State.Harvested;

    struct Item {
        uint sku; // Stock Keeping Unit (SKU)
        uint upc; // Universal Product Code (UPC)
        address ownerID; // address of the current owner
        address originFarmerID; // address of the Farmer
        string originFarmName; // Farmer Name
        string originFarmMetadata; // Farmer Information
        string originFarmLatitude; // Farm Latitude
        string originFarmLongitude; // Farm Longitude
        uint productID; // Product ID
        string productMetadata; // Product Notes
        uint productPrice; // Product Price
        State itemState; // Product State
        address distributorID; // address of the Distributor
        address retailerID; // address of the Retailer
        address consumerID; // address of the Consumer
    }
    mapping(uint => Item) private items;

    struct TraceHash {
        bytes32 harvestedHash;
        bytes32 processedHash;
        bytes32 packagedHash;
        bytes32 sellToDistHash;
        bytes32 buyAsDistHash;
        bytes32 sellToRetailHash;
        bytes32 buyAsRetailHash;
        bytes32 sellToConsumerHash;
        bytes32 buyAsConsumerHash;
    }
    mapping(uint => TraceHash) private traceHashes;

    ////////////////////////////////EVENTS
    event Harvested(uint upc);
    event Processed(uint upc);
    event Packaged(uint upc);
    event ForSale(uint upc);
    event SoldToDist(uint upc);
    event SoldToRetail(uint upc);
    event SoldToConsumer(uint upc);
    event Shipped(uint upc);
    event Received(uint upc);
    event Purchased(uint upc);

    ////////////////////////////////MODIFIERS
    modifier onlyOwner() {
        require(msg.sender == owner, "INVALID: Unauthorized");
        _;
    }

    modifier verifyCaller(address _address) {
        require(msg.sender == _address, "INVALID: Not Verified");
        _;
    }

    modifier paidEnough(uint _price) {
        require(msg.value >= _price, "INVALID: Insufficient Amount");
        _;
    }

    modifier checkValue(uint _upc) {
        _;
        uint _price = items[_upc].productPrice;
        uint amountToReturn = msg.value - _price;
        msg.sender.transfer(amountToReturn);
    }

    modifier harvested(uint _upc) {
        require(
            items[_upc].itemState == State.Harvested,
            "INVALID: Item Not Harvested"
        );
        _;
    }

    modifier processed(uint _upc) {
        require(
            items[_upc].itemState == State.Processed,
            "INVALID: Item Not Processed"
        );
        _;
    }

    modifier packaged(uint _upc) {
        require(
            items[_upc].itemState == State.Packaged,
            "INVALID: Item Not Packaged"
        );
        _;
    }

    modifier shipped(uint _upc) {
        require(
            items[_upc].itemState == State.Shipped,
            "INVALID: Item Not Shipped"
        );
        _;
    }

    modifier forSale(uint _upc) {
        require(
            items[_upc].itemState == State.ForSale,
            "INVALID: Item Not For Sale"
        );
        _;
    }

    modifier sold(uint _upc) {
        require(
            items[_upc].itemState == State.SoldToDist,
            "INVALID: Not Sold To Distributor"
        );
        _;
    }

    modifier received(uint _upc) {
        require(
            items[_upc].itemState == State.Received,
            "INVALID: Item Not Received"
        );
        _;
    }

    modifier purchased(uint _upc) {
        require(
            items[_upc].itemState == State.Purchased,
            "INVALID: Item Not Purchased"
        );
        _;
    }

    ////////////////////////////////BODY
    constructor() public {
        owner = msg.sender;
        sku = 1;
        upc = 2;
    }

    //////////////////////////////////////////farmer's call
    function harvestItem(
        string _originFarmName,
        string _originFarmMetadata,
        string _originFarmLatitude,
        string _originFarmLongitude,
        string _productMetadata,
        uint _productPrice
    ) public {
        uint _productID = uint(keccak256(abi.encode(upc + sku)));
        items[upc] = Item(
            sku,
            upc,
            msg.sender,
            msg.sender,
            _originFarmName,
            _originFarmMetadata,
            _originFarmLatitude,
            _originFarmLongitude,
            _productID,
            _productMetadata,
            _productPrice,
            DEFAULT_STATE,
            address(0),
            address(0),
            address(0)
        );
        traceHashes[upc] = TraceHash(
            blockhash(block.number),
            bytes32(0),
            bytes32(0),
            bytes32(0),
            bytes32(0),
            bytes32(0),
            bytes32(0),
            bytes32(0),
            bytes32(0)
        );

        processItem(upc);
        sku += 1;
        upc += 1;

        if (!isFarmer(msg.sender)) {
            addFarmer(msg.sender);
        }

        emit Harvested(upc);
    }

    function processItem(uint _upc) private harvested(_upc) {
        items[_upc].itemState = State.Processed;
        traceHashes[_upc].packagedHash = blockhash(block.number);
        packagedItem(_upc);
        emit Processed(_upc);
    }

    function packagedItem(uint _upc) private processed(_upc) {
        items[_upc].itemState = State.Packaged;
        traceHashes[_upc].packagedHash = blockhash(block.number);
        sellToDist(_upc);
        emit Packaged(_upc);
    }

    function sellToDist(uint _upc) private packaged(_upc) {
        items[_upc].itemState = State.ForSale;
        traceHashes[_upc].sellToDistHash = blockhash(block.number);
        emit ForSale(_upc);
    }

    //////////////////////////////////////////distributor's call
    function buyAsDist(uint _upc)
        public
        payable
        forSale(_upc)
        paidEnough(items[_upc].productPrice)
        checkValue(_upc)
    {
        traceHashes[_upc].buyAsDistHash = blockhash(block.number);
        items[_upc].ownerID = msg.sender;
        items[_upc].distributorID = msg.sender;
        items[_upc].itemState = State.SoldToDist;
        items[_upc].originFarmerID.transfer(items[_upc].productPrice);

        if (!isDistributor(msg.sender)) {
            addDistributor(msg.sender);
        }

        emit SoldToDist(_upc);
    }

    function shipItem(uint _upc, uint _amount)
        public
        sold(_upc)
        onlyDistributor
        verifyCaller(items[_upc].originFarmerID)
    {
        items[_upc].itemState = State.Shipped;

        sellToRetail(_upc, _amount);
        emit Shipped(_upc);
    }

    function sellToRetail(uint _upc, uint _amount)
        private
        received(_upc)
        onlyDistributor
    {
        items[_upc].itemState = State.ForSale;
        items[_upc].productPrice = _amount;
        traceHashes[_upc].sellToRetailHash = blockhash(block.number);
        emit ForSale(_upc);
    }

    //////////////////////////////////////////retailer's call
    function buyAsRetail(uint _upc)
        public
        payable
        forSale(_upc)
        paidEnough(items[_upc].productPrice)
        checkValue(_upc)
    {
        traceHashes[_upc].buyAsRetailHash = blockhash(block.number);
        items[_upc].ownerID = msg.sender;
        items[_upc].itemState = State.SoldToRetail;
        items[_upc].distributorID.transfer(items[_upc].productPrice);

        if (!isRetailer(msg.sender)) {
            addRetailer(msg.sender);
        }

        receiveAsRetail(_upc);
        emit SoldToRetail(_upc);
    }

    function receiveAsRetail(uint _upc) private forSale(_upc) {
        addRetailer(msg.sender);
        items[_upc].ownerID = msg.sender;
        items[_upc].retailerID = msg.sender;
        items[_upc].itemState = State.Received;

        sellToConsumer(_upc);
        emit Received(_upc);
    }

    function sellToConsumer(uint _upc)
        private
        received(_upc)
        onlyRetailer
        verifyCaller(items[_upc].originFarmerID)
    {
        items[_upc].itemState = State.ForSale;
        traceHashes[_upc].sellToConsumerHash = blockhash(block.number);
        emit ForSale(_upc);
    }

    //////////////////////////////////////////consumer's call
    function buyAsConsumer(uint _upc)
        public
        payable
        forSale(_upc)
        paidEnough(items[_upc].productPrice)
        checkValue(_upc)
    {
        traceHashes[_upc].buyAsConsumerHash = blockhash(block.number);
        items[_upc].ownerID = msg.sender;
        items[_upc].itemState = State.SoldToConsumer;
        items[_upc].retailerID.transfer(items[_upc].productPrice);

        if (!isConsumer(msg.sender)) {
            addConsumer(msg.sender);
        }

        receiveAsConsumer(_upc);
        emit SoldToConsumer(_upc);
    }

    function receiveAsConsumer(uint _upc) private forSale(_upc) {
        addConsumer(msg.sender);
        items[_upc].ownerID = msg.sender;
        items[_upc].consumerID = msg.sender;
        items[_upc].itemState = State.Received;

        emit Received(_upc);
    }

    // function purchaseItem(uint _upc) private received(_upc) onlyConsumer {
    //     items[_upc].ownerID = msg.sender;
    //     items[_upc].consumerID = msg.sender;
    //     items[_upc].itemState = State.Purchased;
    //     emit Purchased(_upc);
    // }

    //////////////////////////////////////////QUERIES
    function fetchMyItems() public view returns (Item[] memory) {
        uint itemCount = sku;
        uint currentIndex = 0;

        Item[] memory item = new Item[](itemCount);
        for (uint i = 0; i < itemCount; i++) {
            if (
                items[i + 1].ownerID == msg.sender
                // items[i + 1].originFarmerID == msg.sender ||
                // items[i + 1].distributorID == msg.sender ||
                // items[i + 1].retailerID == msg.sender ||
                // items[i + 1].consumerID == msg.sender
            ) {
                uint currentId = i + 1;
                Item storage currentproduct = items[currentId];
                item[currentIndex] = currentproduct;
                currentIndex += 1;
            }
        }
        return item;
    }

    function fetchCurrentState(uint _upc) public view returns (uint itemState) {
        Item memory item = items[_upc];
        return uint(item.itemState);
    }

    function fetchItemBufferOne(uint _upc)
        public
        view
        returns (
            uint itemSKU,
            uint itemUPC,
            address ownerID,
            address originFarmerID,
            string originFarmName,
            string originFarmMetadata,
            string originFarmLatitude,
            string originFarmLongitude
        )
    {
        Item memory item = items[_upc];
        itemSKU = item.sku;
        itemUPC = item.upc;
        ownerID = item.ownerID;
        originFarmerID = item.originFarmerID;
        originFarmName = item.originFarmName;
        originFarmMetadata = item.originFarmMetadata;
        originFarmLatitude = item.originFarmLatitude;
        originFarmLongitude = item.originFarmLongitude;

        return (
            itemSKU,
            itemUPC,
            ownerID,
            originFarmerID,
            originFarmName,
            originFarmMetadata,
            originFarmLatitude,
            originFarmLongitude
        );
    }

    function fetchItemBufferTwo(uint _upc)
        public
        view
        returns (
            uint itemSKU,
            uint itemUPC,
            uint productID,
            string productMetadata,
            uint productPrice,
            uint itemState,
            address distributorID,
            address retailerID,
            address consumerID
        )
    {
        Item memory item = items[_upc];
        itemSKU = item.sku;
        itemUPC = item.upc;
        productID = item.productID;
        productMetadata = item.productMetadata;
        productPrice = item.productPrice;
        itemState = uint(item.itemState);
        distributorID = item.distributorID;
        retailerID = item.retailerID;
        consumerID = item.consumerID;

        return (
            itemSKU,
            itemUPC,
            productID,
            productMetadata,
            productPrice,
            itemState,
            distributorID,
            retailerID,
            consumerID
        );
    }

    function fetchItemBufferThree(uint _upc)
        public
        view
        returns (
            uint itemSKU,
            uint itemUPC,
            bytes32 harvestedHash,
            bytes32 processedHash,
            bytes32 packagedHash,
            bytes32 sellToDistHash,
            bytes32 buyAsDistHash,
            bytes32 sellToRetailHash,
            bytes32 buyAsRetailHash,
            bytes32 sellToConsumerHash,
            bytes32 buyAsConsumerHash
        )
    {
        Item memory item = items[_upc];
        itemSKU = item.sku;
        itemUPC = item.upc;

        TraceHash memory trace = traceHashes[_upc];
        harvestedHash = trace.harvestedHash;
        processedHash = trace.processedHash;
        packagedHash = trace.packagedHash;
        sellToDistHash = trace.sellToDistHash;
        buyAsDistHash = trace.buyAsDistHash;
        sellToRetailHash = trace.buyAsRetailHash;
        buyAsRetailHash = trace.buyAsRetailHash;
        sellToConsumerHash = trace.sellToConsumerHash;
        buyAsConsumerHash = trace.buyAsConsumerHash;

        return (
            itemSKU,
            itemUPC,
            harvestedHash,
            processedHash,
            packagedHash,
            sellToDistHash,
            buyAsDistHash,
            sellToRetailHash,
            buyAsRetailHash,
            sellToConsumerHash,
            buyAsConsumerHash
        );
    }

    //////////////////////////////////////////KILL SWITCH
    function kill() public onlyOwner {
        selfdestruct(owner);
    }
}
