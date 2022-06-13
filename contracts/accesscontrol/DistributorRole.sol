// SPDX-License-Identifier: UNLICENCED

pragma solidity ^0.4.24;

import "./Roles.sol";

contract DistributorRole {
    using Roles for Roles.Role;

    Roles.Role private distributors;

    event DistributorAdded(address indexed account);
    event DistributorRemoved(address indexed account);

    modifier onlyDistributor() {
        require(isDistributor(msg.sender), "INVALID: Not a Distributor");
        _;
    }

    constructor() public {
        _addDistributor(msg.sender);
    }

    function isDistributor(address account) public view returns (bool) {
        return distributors.has(account);
    }

    function addDistributor(address account) public {
        _addDistributor(account);
    }

    function renounceDistributor() public onlyDistributor {
        _removeDistributor(msg.sender);
    }

    function _addDistributor(address account) internal {
        distributors.add(account);
        emit DistributorAdded(account);
    }

    function _removeDistributor(address account) internal {
        distributors.remove(account);
        emit DistributorRemoved(account);
    }
}
