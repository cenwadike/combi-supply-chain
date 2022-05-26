// SPDX-License-Identifier: UNLICENCED

pragma solidity ^0.4.24;

import "./Roles.sol";

contract FarmerRole {
    using Roles for Roles.Role;

    Roles.Role private farmers;

    event FarmerAdded(address indexed account);
    event FarmerRemoved(address indexed account);

    modifier onlyFarmer() {
        require(isFarmer(msg.sender), "INVALID: Not a Farmer");
        _;
    }

    constructor() public {
        _addFarmer(msg.sender);
    }

    function isFarmer(address account) public view returns (bool) {
        return farmers.has(account);
    }

    function addFarmer(address account) public onlyFarmer {
        _addFarmer(account);
    }

    function renounceFarmer() public {
        _removeFarmer(msg.sender);
    }

    function _addFarmer(address account) internal {
        farmers.add(account);
        emit FarmerAdded(account);
    }

    function _removeFarmer(address account) internal {
        farmers.remove(account);
        emit FarmerRemoved(account);
    }
}
