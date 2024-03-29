// SPDX-License-Identifier: UNLICENCED

pragma solidity ^0.8.6;

import "../accesscontrol/FarmerRole.sol";
import "../accesscontrol/DistributorRole.sol";
import "../accesscontrol/RetailerRole.sol";
import "../accesscontrol/ConsumerRole.sol";
import "../core/Ownable.sol";

import "@openzeppelin/contracts/utils/Counters.sol";

contract SupplyChain is
    FarmerRole,
    DistributorRole,
    RetailerRole,
    ConsumerRole
{
    ////////////////////////////////DATA
    address payable public owner;

    using Counters for Counters.Counter;
    Counters.Counter public upc;
    Counters.Counter public sku;

    struct Item {
        uint256 sku; // Stock Keeping Unit (SKU)
        uint256 upc; // Universal Product Code (UPC)
        uint256 productID; // Product ID
        uint256 productPrice; // Product Price
        string productMetadata; // Product Notes
        address payable ownerID; // address of the current owner
        address payable originFarmerID; // address of the Farmer
        address payable distributorID; // address of the Distributor
        address payable retailerID; // address of the Retailer
        address payable consumerID; // address of the Consumer
        string originFarmName; // Farmer Name
        string originFarmMetadata; // Farmer Information
        string originFarmLatitude; // Farm Latitude
        string originFarmLongitude; // Farm Longitude
        State itemState; // Product State
    }
    mapping(uint256 => Item) private items;

    struct TraceHash {
        uint256 upc; // product upc
        bytes32 harvestedHash; // hash of product harvest
        bytes32 sellToDistHash; // hash of product being placed on sale to distributor
        bytes32 buyAsDistHash; // hash of product being bought by distributor
        bytes32 sellToRetailHash; // hash of product being placed on sale to retailer
        bytes32 buyAsRetailHash; // hash of product being bought by retailer
        bytes32 sellToConsumerHash; // hash of product being placed on sale to consumer
        bytes32 buyAsConsumerHash; // hash of product being bought by consumer
    }
    mapping(uint256 => TraceHash) private traceHashes;

    enum State {
        Harvested,
        ForSale,
        SoldToDist,
        SoldToRetail,
        ShippedToRetail,
        ReceivedByRetail,
        SoldToConsumer,
        ReceivedByConsumer
    }

    ////////////////////////////////EVENTS
    event Harvested(uint256 upc);
    event ForSale(uint256 upc);
    event SoldToDist(uint256 upc, uint256 amount);
    event SoldToRetail(uint256 upc);
    event ShippedToRetail(uint256 upc);
    event ReceivedByRetail(uint256 upc);
    event SoldToConsumer(uint256 upc);
    event ReceivedByCustomer(uint256 upc);

    ////////////////////////////////MODIFIERS
    modifier onlyOwner() {
        require(msg.sender == owner, "INVALID: Unauthorized");
        _;
    }

    modifier harvested(uint256 _upc) {
        require(
            items[_upc].itemState == State.Harvested,
            "INVALID: Item Not Harvested"
        );
        _;
    }

    modifier forSale(uint256 _upc) {
        require(
            items[_upc].itemState == State.ForSale,
            "INVALID: Item Not For Sale"
        );
        _;
    }

    modifier soldByDistributor(uint256 _upc) {
        require(
            traceHashes[_upc].sellToDistHash !=
                keccak256(abi.encode("DIRECT_TO_RETAILER_SALE")),
            "INVALID: Not Sold By Distributor"
        );
        _;
    }

    modifier soldToConsumer(uint256 _upc) {
        require(
            items[_upc].itemState == State.SoldToConsumer,
            "INVALID: Not Sold To consumer"
        );
        _;
    }

    modifier SoldToRetailer(uint256 _upc) {
        require(
            items[_upc].itemState == State.SoldToRetail,
            "INVALID: Not Sold To retailer"
        );
        _;
    }

    ////////////////////////////////BODY
    constructor() {
        owner = payable(msg.sender);
    }

    //////////////////////////////////////////farmer's call
    function harvestItem(
        string memory _originFarmName,
        string memory _originFarmMetadata,
        string memory _originFarmLatitude,
        string memory _originFarmLongitude,
        string memory _productMetadata,
        uint256 _productPrice
    ) public {
        upc.increment();
        sku.increment();
        uint256 _productID = uint(
            keccak256(abi.encode(upc.current(), sku.current()))
        );
        items[upc.current()] = Item(
            sku.current(),
            upc.current(),
            _productID,
            _productPrice,
            _productMetadata,
            payable(msg.sender),
            payable(msg.sender),
            payable(address(0)),
            payable(address(0)),
            payable(address(0)),
            _originFarmName,
            _originFarmMetadata,
            _originFarmLatitude,
            _originFarmLongitude,
            State.Harvested
        );

        traceHashes[upc.current()] = TraceHash(
            upc.current(),
            blockhash(block.number - 1),
            bytes32(0),
            bytes32(0),
            bytes32(0),
            bytes32(0),
            bytes32(0),
            bytes32(0)
        );

        sellToDist(upc.current());

        if (!isFarmer(msg.sender)) {
            addFarmer(msg.sender);
        }

        emit Harvested(upc.current());
    }

    function sellToDist(uint256 _upc) private {
        items[_upc].itemState = State.ForSale;
        traceHashes[_upc].sellToDistHash = blockhash(block.number - 1);
        emit ForSale(_upc);
    }

    //////////////////////////////////////////distributor's call
    function buyAsDist(uint256 _upc, uint256 _newPrice) public payable {
        require(_upc <= upc._value, "ERR: Product does not exist");
        require(
            msg.sender != items[_upc].originFarmerID,
            "DistributorID cannot be farmerID"
        );
        require(
            items[_upc].distributorID == address(0),
            "Already bought by a distributor"
        );
        require(
            msg.value == items[_upc].productPrice,
            "Insufficient Amount transfered"
        );

        items[_upc].ownerID = payable(msg.sender);
        items[_upc].distributorID = payable(msg.sender);
        items[_upc].itemState = State.SoldToDist;
        items[_upc].productPrice = _newPrice;

        traceHashes[_upc].buyAsDistHash = blockhash(block.number - 1);

        if (!isDistributor(msg.sender)) {
            addDistributor(msg.sender);
        }

        items[_upc].ownerID.transfer(msg.value);
        emit SoldToDist(_upc, items[_upc].productPrice);
    }

    //////////////////////////////////////////retailer's call
    function buyAsRetail(uint256 _upc, uint256 _newPrice) public payable {
        require(_upc <= upc._value, "ERR: Product does not exist");
        require(msg.sender != items[_upc].ownerID, "Cannot buy from self");
        require(
            items[_upc].retailerID == address(0),
            "Already bought by retailer"
        );
        require(
            msg.value == items[_upc].productPrice,
            "Insufficient Amount transfered"
        );

        items[_upc].retailerID = payable(msg.sender);

        traceHashes[_upc].buyAsRetailHash = blockhash(block.number - 1);

        items[_upc].ownerID.transfer(items[_upc].productPrice);

        if (items[_upc].distributorID == address(0)) {
            sellDirectToRetailer(_upc, _newPrice);
        } else {
            sellToRetail(_upc, _newPrice);
        }

        if (!isRetailer(msg.sender)) {
            addRetailer(msg.sender);
        }

        receiveAsRetail(_upc);
        emit SoldToRetail(_upc);
    }

    function sellToRetail(uint256 _upc, uint256 _newPrice) private {
        items[_upc].itemState = State.SoldToRetail;
        items[_upc].productPrice = _newPrice;
        traceHashes[_upc].sellToRetailHash = blockhash(block.number - 1);

        shipItem(_upc);
    }

    function sellDirectToRetailer(uint256 _upc, uint256 _newPrice) private {
        items[_upc].itemState = State.SoldToRetail;
        items[_upc].productPrice = _newPrice;
        items[_upc].distributorID = payable(address(0));
        traceHashes[_upc].sellToDistHash = keccak256(
            abi.encode("DIRECT_TO_RETAILER_SALE")
        );
        traceHashes[_upc].sellToRetailHash = blockhash(block.number - 1);
    }

    function shipItem(uint256 _upc) private soldByDistributor(_upc) {
        items[_upc].ownerID = items[_upc].retailerID;

        emit ShippedToRetail(_upc);
    }

    function receiveAsRetail(uint256 _upc) private SoldToRetailer(_upc) {
        items[_upc].itemState = State.ReceivedByRetail;

        emit ReceivedByRetail(_upc);
    }

    //////////////////////////////////////////consumer's call
    function buyAsConsumer(uint256 _upc) public payable {
        require(_upc <= upc._value, "ERR: Product does not exist");
        require(msg.sender != items[_upc].ownerID, "Cannot buy from self");
        require(
            items[_upc].consumerID == address(0),
            "Item already bought by consumer"
        );
        require(
            msg.value == items[_upc].productPrice,
            "Insufficient Amount transfered"
        );

        items[_upc].consumerID = payable(msg.sender);
        items[_upc].itemState = State.ForSale;
        traceHashes[_upc].buyAsConsumerHash = blockhash(block.number - 1);

        if (
            items[_upc].distributorID == address(0) &&
            items[_upc].retailerID == address(0)
        ) {
            sellDirectToConsumer(_upc);
        } else {
            sellToConsumer(_upc);
        }

        if (!isConsumer(msg.sender)) {
            addConsumer(msg.sender);
        }

        receiveAsConsumer(_upc);
        items[_upc].ownerID.transfer(items[_upc].productPrice);

        emit SoldToConsumer(_upc);
    }

    function sellToConsumer(uint256 _upc) private {
        items[_upc].itemState = State.SoldToConsumer;
        traceHashes[_upc].sellToConsumerHash = blockhash(block.number - 1);
    }

    function sellDirectToConsumer(uint256 _upc) private {
        items[_upc].itemState = State.SoldToConsumer;
        traceHashes[_upc].sellToDistHash = keccak256(
            abi.encode("DIRECT_TO_CONSUMER_SALE")
        );
        traceHashes[_upc].sellToDistHash = keccak256(
            abi.encode("DIRECT_TO_RETAILER_SALE")
        );
        traceHashes[_upc].sellToRetailHash = blockhash(block.number - 1);
    }

    function receiveAsConsumer(uint256 _upc) private soldToConsumer(_upc) {
        items[_upc].ownerID = items[_upc].consumerID;
        items[_upc].itemState = State.ReceivedByConsumer;

        emit ReceivedByCustomer(_upc);
    }

    /******* generic buy *********************************************/
    function buy(uint256 _upc, uint256 _newPrice) external payable {
        if (items[_upc].distributorID == address(0)) {
            buyAsDist(_upc, _newPrice);
        }
        if (items[_upc].retailerID == address(0)) {
            buyAsRetail(_upc, _newPrice);
        } else {
            buyAsConsumer(_upc);
        }
    }

    //////////////////////////////////////////QUERIES AND CALLS
    /****** farmer query ********************************************/
    function fetchFarmerItems() public view returns (Item[] memory) {
        uint256 totalItemCount = sku.current();
        uint256 itemCount = 0;
        uint256 currentIndex = 0;

        for (uint256 i = 0; i < totalItemCount; i++) {
            if (items[i + 1].originFarmerID == msg.sender) {
                itemCount += 1;
            }
        }

        Item[] memory products = new Item[](itemCount);
        for (uint256 i = 0; i <= itemCount; i++) {
            if (
                items[i + 1].originFarmerID == msg.sender ||
                items[i + 1].ownerID == msg.sender
            ) {
                uint256 currentId = i + 1;
                Item storage currentproduct = items[currentId];
                products[currentIndex] = currentproduct;
                currentIndex += 1;
            }
        }
        return products;
    }

    /******** distributor query ************************************/
    function fetchDistroItems() public view returns (Item[] memory) {
        uint256 totalItemCount = sku.current();
        uint256 itemCount = 0;
        uint256 currentIndex = 0;

        for (uint256 i = 0; i < totalItemCount; i++) {
            if (items[i + 1].distributorID == msg.sender) {
                itemCount += 1;
            }
        }

        Item[] memory products = new Item[](itemCount);
        for (uint256 i = 0; i <= itemCount; i++) {
            if (
                items[i + 1].distributorID == msg.sender ||
                items[i + 1].ownerID == msg.sender
            ) {
                uint256 currentId = i + 1;
                Item storage currentproduct = items[currentId];
                products[currentIndex] = currentproduct;
                currentIndex += 1;
            }
        }
        return products;
    }

    function fetchAvailableItemsForDistro()
        public
        view
        returns (Item[] memory)
    {
        uint256 totalItemCount = sku.current();
        uint256 itemCount = 0;
        uint256 currentIndex = 0;

        for (uint256 i = 0; i < totalItemCount; i++) {
            if (
                items[i + 1].ownerID != address(0) &&
                items[i + 1].distributorID == address(0)
            ) {
                itemCount += 1;
            }
        }

        Item[] memory products = new Item[](itemCount);
        for (uint256 i = 0; i <= itemCount; i++) {
            if (
                items[i + 1].ownerID != address(0) &&
                items[i + 1].distributorID == address(0)
            ) {
                uint256 currentId = i + 1;
                Item storage currentproduct = items[currentId];
                products[currentIndex] = currentproduct;
                currentIndex += 1;
            }
        }
        return products;
    }

    /******** retailer query ****************************************/
    function fetchRetailerItems() public view returns (Item[] memory) {
        uint256 totalItemCount = sku.current();
        uint256 itemCount = 0;
        uint256 currentIndex = 0;

        for (uint256 i = 0; i < totalItemCount; i++) {
            if (items[i + 1].retailerID == msg.sender) {
                itemCount += 1;
            }
        }

        Item[] memory products = new Item[](itemCount);
        for (uint256 i = 0; i <= itemCount; i++) {
            if (
                items[i + 1].retailerID == msg.sender ||
                items[i + 1].ownerID == msg.sender
            ) {
                uint256 currentId = i + 1;
                Item storage currentproduct = items[currentId];
                products[currentIndex] = currentproduct;
                currentIndex += 1;
            }
        }
        return products;
    }

    function fetchAvailableItemsForRetailer()
        public
        view
        returns (Item[] memory)
    {
        uint256 totalItemCount = sku.current();
        uint256 itemCount = 0;
        uint256 currentIndex = 0;

        for (uint256 i = 0; i < totalItemCount; i++) {
            if (
                items[i + 1].ownerID != address(0) &&
                items[i + 1].retailerID == address(0)
            ) {
                itemCount += 1;
            }
        }

        Item[] memory products = new Item[](itemCount);
        for (uint256 i = 0; i <= itemCount; i++) {
            if (
                items[i + 1].ownerID != address(0) &&
                items[i + 1].retailerID == address(0)
            ) {
                uint256 currentId = i + 1;
                Item storage currentproduct = items[currentId];
                products[currentIndex] = currentproduct;
                currentIndex += 1;
            }
        }
        return products;
    }

    /******** consumer query ****************************************/
    function fetchConsumerItems() public view returns (Item[] memory) {
        uint256 totalItemCount = sku.current();
        uint256 itemCount = 0;
        uint256 currentIndex = 0;

        for (uint256 i = 0; i < totalItemCount; i++) {
            if (items[i + 1].consumerID == msg.sender) {
                itemCount += 1;
            }
        }

        Item[] memory products = new Item[](itemCount);
        for (uint256 i = 0; i <= itemCount; i++) {
            if (
                items[i + 1].consumerID == msg.sender ||
                items[i + 1].ownerID == msg.sender
            ) {
                uint256 currentId = i + 1;
                Item storage currentproduct = items[currentId];
                products[currentIndex] = currentproduct;
                currentIndex += 1;
            }
        }
        return products;
    }

    function fetchAvailableItemsForConsumer()
        public
        view
        returns (Item[] memory)
    {
        uint256 totalItemCount = sku.current();
        uint256 itemCount = 0;
        uint256 currentIndex = 0;

        for (uint256 i = 0; i < totalItemCount; i++) {
            if (
                items[i + 1].ownerID != address(0) &&
                items[i + 1].consumerID == address(0)
            ) {
                itemCount += 1;
            }
        }

        Item[] memory products = new Item[](itemCount);
        for (uint256 i = 0; i <= itemCount; i++) {
            if (
                items[i + 1].ownerID != address(0) &&
                items[i + 1].consumerID == address(0)
            ) {
                uint256 currentId = i + 1;
                Item storage currentproduct = items[currentId];
                products[currentIndex] = currentproduct;
                currentIndex += 1;
            }
        }
        return products;
    }

    /******** general supplychain query ****************************/
    function fetchItems() public view returns (Item[] memory) {
        uint256 itemCount = sku.current();
        uint256 currentIndex = 0;

        Item[] memory products = new Item[](itemCount);
        for (uint256 i = 0; i <= itemCount; i++) {
            if (items[i + 1].ownerID != address(0)) {
                uint256 currentId = i + 1;
                Item storage currentproduct = items[currentId];
                products[currentIndex] = currentproduct;
                currentIndex += 1;
            }
        }
        return products;
    }

    function fetchItemHashes(uint256 _upc)
        public
        view
        returns (TraceHash[] memory)
    {
        require(_upc <= upc._value, "ERR: Product does not exist");

        uint256 itemCount = sku.current();
        uint256 currentIndex = 0;

        TraceHash[] memory productHash = new TraceHash[](itemCount);
        for (uint256 i = 0; i <= itemCount; i++) {
            if (traceHashes[i + 1].upc == _upc) {
                uint256 currentId = i + 1;
                TraceHash storage currentproductHash = traceHashes[currentId];
                productHash[currentIndex] = currentproductHash;
                currentIndex += 1;
            }
        }
        return productHash;
    }

    function fetchCurrentPrice(uint256 _upc)
        public
        view
        returns (uint256 price)
    {
        require(_upc <= upc._value, "ERR: Product does not exist");

        Item memory item = items[_upc];
        return item.productPrice;
    }

    function fetchCurrentState(uint256 _upc)
        public
        view
        returns (uint256 itemState)
    {
        require(_upc <= upc._value, "ERR: Product does not exist");
        Item memory item = items[_upc];
        return uint(item.itemState);
    }

    //////////////////////////////////////////KILL SWITCH
    function kill() public onlyOwner {
        selfdestruct(payable(owner));
    }
}
