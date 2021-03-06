// SPDX-License-Identifier: UNLICENCED

pragma solidity ^0.8.6;

import "./Roles.sol";

contract RetailerRole {
    using Roles for Roles.Role;

    Roles.Role private retailers;

    event RetailerAdded(address indexed account);
    event RetailerRemoved(address indexed account);

    modifier onlyRetailer() {
        require(isRetailer(msg.sender), "INVALID: Not a Retailer");
        _;
    }

    constructor() {
        _addRetailer(msg.sender);
    }

    function isRetailer(address account) public view returns (bool) {
        return retailers.has(account);
    }

    function addRetailer(address account) public {
        _addRetailer(account);
    }

    function renounceRetailer() public onlyRetailer {
        _removeRetailer(msg.sender);
    }

    function _addRetailer(address account) internal {
        retailers.add(account);
        emit RetailerAdded(account);
    }

    function _removeRetailer(address account) internal {
        retailers.remove(account);
        emit RetailerRemoved(account);
    }
}
