//SPDX-License-Identifier: Unlicense

pragma solidity ^0.4.24;

import "./Roles.sol";

contract ConsumerRole {
    using Roles for Roles.Role;

    Roles.Role private consumers;

    event ConsumerAdded(address indexed account);
    event ConsumerRemoved(address indexed account);

    modifier onlyConsumer() {
        require(isConsumer(msg.sender), "INVALID: Not a Consumer");
        _;
    }

    constructor() public {
        _addConsumer(msg.sender);
    }

    function isConsumer(address account) public view returns (bool) {
        return consumers.has(account);
    }

    function addConsumer(address account) public onlyConsumer {
        _addConsumer(account);
    }

    function renounceConsumer() public {
        _removeConsumer(msg.sender);
    }

    function _addConsumer(address account) internal {
        consumers.add(account);
        emit ConsumerAdded(account);
    }

    function _removeConsumer(address account) internal {
        consumers.remove(account);
        emit ConsumerRemoved(account);
    }
}
