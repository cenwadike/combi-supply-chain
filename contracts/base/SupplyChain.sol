// SPDX-License-Identifier: UNLICENCED

pragma solidity ^0.8.6;
// pragma experimental ABIEncoderV2;

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

    uint256 public upc = 0;
    uint256 public sku = 0;

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
        uint256 sku; // Stock Keeping Unit (SKU)
        uint256 upc; // Universal Product Code (UPC)
        address ownerID; // address of the current owner
        address originFarmerID; // address of the Farmer
        string originFarmName; // Farmer Name
        string originFarmMetadata; // Farmer Information
        string originFarmLatitude; // Farm Latitude
        string originFarmLongitude; // Farm Longitude
        uint256 productID; // Product ID
        string productMetadata; // Product Notes
        uint256 productPrice; // Product Price
        State itemState; // Product State
        address distributorID; // address of the Distributor
        address retailerID; // address of the Retailer
        address consumerID; // address of the Consumer
    }
    mapping(uint256 => Item) private items;

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
    mapping(uint256 => TraceHash) private traceHashes;

    ////////////////////////////////EVENTS
    event Harvested(uint256 upc);
    event Processed(uint256 upc);
    event Packaged(uint256 upc);
    event ForSale(uint256 upc);
    event SoldToDist(uint256 upc);
    event SoldToRetail(uint256 upc);
    event SoldToConsumer(uint256 upc);
    event Shipped(uint256 upc);
    event Received(uint256 upc);
    event Purchased(uint256 upc);

    ////////////////////////////////MODIFIERS
    modifier onlyOwner() {
        require(msg.sender == owner, "INVALID: Unauthorized");
        _;
    }

    modifier verifyCaller(address _address) {
        require(msg.sender == _address, "INVALID: Not Verified");
        _;
    }

    // modifier paidEnough(uint256 _price) {
    //     require(msg.value >= _price, "INVALID: Insufficient Amount");
    //     _;
    // }

    // modifier checkValue(uint256 _upc) {
    //     _;
    //     uint256 _price = items[_upc].productPrice;
    //     uint256 amountToReturn = msg.value - _price;
    //     msg.sender.transfer(amountToReturn);
    // }

    modifier harvested(uint256 _upc) {
        require(
            items[_upc].itemState == State.Harvested,
            "INVALID: Item Not Harvested"
        );
        _;
    }

    modifier processed(uint256 _upc) {
        require(
            items[_upc].itemState == State.Processed,
            "INVALID: Item Not Processed"
        );
        _;
    }

    modifier packaged(uint256 _upc) {
        require(
            items[_upc].itemState == State.Packaged,
            "INVALID: Item Not Packaged"
        );
        _;
    }

    modifier shipped(uint256 _upc) {
        require(
            items[_upc].itemState == State.Shipped,
            "INVALID: Item Not Shipped"
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

    modifier soldToDist(uint256 _upc) {
        require(
            items[_upc].itemState == State.SoldToDist,
            "INVALID: Not Sold To Distributor"
        );
        _;
    }

    modifier soldToRetailer(uint256 _upc) {
        require(
            items[_upc].itemState == State.SoldToRetail,
            "INVALID: Not Sold To Distributor"
        );
        _;
    }

    modifier received(uint256 _upc) {
        require(
            items[_upc].itemState == State.Received,
            "INVALID: Item Not Received"
        );
        _;
    }

    modifier purchased(uint256 _upc) {
        require(
            items[_upc].itemState == State.Purchased,
            "INVALID: Item Not Purchased"
        );
        _;
    }

    ////////////////////////////////BODY
    constructor() {
        owner = msg.sender;
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
        uint256 _productID = uint(keccak256(abi.encode(upc + sku)));
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

        if (!isFarmer(msg.sender)) {
            addFarmer(msg.sender);
        }

        emit Harvested(upc);
    }

    function processItem(uint256 _upc) private harvested(_upc) {
        items[_upc].itemState = State.Processed;
        traceHashes[_upc].packagedHash = blockhash(block.number);
        packagedItem(_upc);
        emit Processed(_upc);
    }

    function packagedItem(uint256 _upc) private processed(_upc) {
        items[_upc].itemState = State.Packaged;
        traceHashes[_upc].packagedHash = blockhash(block.number);
        sellToDist(_upc);
        emit Packaged(_upc);
    }

    function sellToDist(uint256 _upc) private packaged(_upc) {
        items[_upc].itemState = State.ForSale;
        traceHashes[_upc].sellToDistHash = blockhash(block.number);

        sku += 1;
        upc += 1;
        emit ForSale(_upc);
    }

    //////////////////////////////////////////distributor's call
    function buyAsDist(uint256 _upc, uint256 _newPrice) public payable {
        uint256 farmerPrice = items[_upc].productPrice;
        address farmer = items[_upc].originFarmerID;

        require(msg.sender != farmer, "DistributorID cannot be farmerID");
        require(msg.value == farmerPrice, "Insufficient Amount transfered");

        items[_upc].ownerID = msg.sender;
        items[_upc].distributorID = msg.sender;
        items[_upc].itemState = State.SoldToDist;
        items[_upc].productPrice = _newPrice;

        traceHashes[_upc].buyAsDistHash = blockhash(block.number);

        if (!isDistributor(msg.sender)) {
            addDistributor(msg.sender);
        }

        payable(farmer).transfer(farmerPrice);
        emit SoldToDist(_upc);
    }

    //////////////////////////////////////////retailer's call
    function buyAsRetail(uint256 _upc, uint256 _newPrice)
        public
        payable
        soldToDist(_upc)
    {
        uint256 distributorPrice = items[_upc].productPrice;

        require(
            msg.sender != items[_upc].originFarmerID,
            "RetailerID cannot be DistroID"
        );
        require(
            msg.value == distributorPrice,
            "Insufficient Amount transfered"
        );

        items[_upc].retailerID = msg.sender;

        traceHashes[_upc].buyAsRetailHash = blockhash(block.number);

        payable(items[_upc].distributorID).transfer(items[_upc].productPrice);

        sellToRetail(_upc, _newPrice);

        if (!isRetailer(msg.sender)) {
            addRetailer(msg.sender);
        }

        receiveAsRetail(_upc);
        emit SoldToRetail(_upc);
    }

    function sellToRetail(uint256 _upc, uint256 _newPrice) private {
        items[_upc].itemState = State.SoldToRetail;
        items[_upc].productPrice = _newPrice;
        traceHashes[_upc].sellToRetailHash = blockhash(block.number);
        emit SoldToRetail(_upc);

        shipItem(_upc);
    }

    function shipItem(uint256 _upc)
        private
        soldToRetailer(_upc)
        verifyCaller(items[_upc].originFarmerID)
    {
        items[_upc].itemState = State.ForSale;
        items[_upc].ownerID = items[_upc].retailerID;

        emit Shipped(_upc);
    }

    function receiveAsRetail(uint256 _upc) private forSale(_upc) {
        addRetailer(msg.sender);
        items[_upc].itemState = State.Received;

        // sellToConsumer(_upc);
        emit Received(_upc);
    }

    //////////////////////////////////////////consumer's call
    function buyAsConsumer(uint256 _upc) public payable received(_upc) {
        traceHashes[_upc].buyAsConsumerHash = blockhash(block.number);
        items[_upc].consumerID = msg.sender;

        sellToConsumer(_upc);

        if (!isConsumer(msg.sender)) {
            addConsumer(msg.sender);
        }

        receiveAsConsumer(_upc);
        payable(items[_upc].retailerID).transfer(items[_upc].productPrice);

        emit SoldToConsumer(_upc);
    }

    function sellToConsumer(uint256 _upc)
        private
        received(_upc)
        verifyCaller(items[_upc].originFarmerID)
    {
        items[_upc].itemState = State.SoldToConsumer;
        traceHashes[_upc].sellToConsumerHash = blockhash(block.number);
        items[_upc].ownerID = items[_upc].consumerID;
        emit ForSale(_upc);
    }

    function receiveAsConsumer(uint256 _upc) private forSale(_upc) {
        addConsumer(msg.sender);
        items[_upc].ownerID = msg.sender;
        items[_upc].consumerID = msg.sender;
        items[_upc].itemState = State.Received;

        emit Received(_upc);
    }

    //////////////////////////////////////////QUERIES AND CALLS
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

    function fetchMyItems() public view returns (Item[] memory) {
        uint256 itemCount = sku;
        uint256 currentIndex = 0;

        Item[] memory item = new Item[](itemCount);
        for (uint256 i = 0; i <= itemCount; i++) {
            if (items[i].ownerID == msg.sender) {
                uint256 currentId = i + 1;
                Item storage currentproduct = items[currentId];
                item[currentIndex] = currentproduct;
                currentIndex += 1;
            }
        }
        return item;
    }

    function fetchFarmerItems() public view returns (Item[] memory) {
        uint256 itemCount = sku;
        uint256 currentIndex = 0;

        Item[] memory item = new Item[](itemCount);
        for (uint256 i = 0; i <= itemCount; i++) {
            if (items[i].originFarmerID == msg.sender) {
                uint256 currentId = i + 1;
                Item storage currentproduct = items[currentId];
                item[currentIndex] = currentproduct;
                currentIndex += 1;
            }
        }
        return item;
    }

    function fetchDistributorItems() public view returns (Item[] memory) {
        uint256 itemCount = sku;
        uint256 currentIndex = 0;

        Item[] memory item = new Item[](itemCount);
        for (uint256 i = 0; i <= itemCount; i++) {
            if (
                items[i].ownerID == msg.sender &&
                items[i].distributorID == msg.sender
            ) {
                uint256 currentId = i + 1;
                Item storage currentproduct = items[currentId];
                item[currentIndex] = currentproduct;
                currentIndex += 1;
            }
        }
        return item;
    }

    function fetchRetailerItems() public view returns (Item[] memory) {
        uint256 itemCount = sku;
        uint256 currentIndex = 0;

        Item[] memory item = new Item[](itemCount);
        for (uint256 i = 0; i <= itemCount; i++) {
            if (
                items[i].ownerID == msg.sender &&
                items[i].retailerID == msg.sender
            ) {
                uint256 currentId = i + 1;
                Item storage currentproduct = items[currentId];
                item[currentIndex] = currentproduct;
                currentIndex += 1;
            }
        }
        return item;
    }

    function fetchConsumerItems() public view returns (Item[] memory) {
        uint256 itemCount = sku;
        uint256 currentIndex = 0;

        Item[] memory item = new Item[](itemCount);
        for (uint256 i = 0; i <= itemCount; i++) {
            if (
                items[i].ownerID == msg.sender &&
                items[i].consumerID == msg.sender
            ) {
                uint256 currentId = i + 1;
                Item storage currentproduct = items[currentId];
                item[currentIndex] = currentproduct;
                currentIndex += 1;
            }
        }
        return item;
    }

    function fetchItemTraceHashes(uint256 _upc)
        public
        view
        returns (TraceHash[] memory)
    {
        traceHashes[_upc];
    }

    function fetchCurrentState(uint256 _upc)
        public
        view
        returns (uint256 itemState)
    {
        Item memory item = items[_upc];
        return uint(item.itemState);
    }

    //////////////////////////////////////////KILL SWITCH
    function kill() public onlyOwner {
        selfdestruct(payable(owner));
    }
}
