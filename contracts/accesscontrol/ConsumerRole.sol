//SPDX-License-Identifier: Unlicense

pragma solidity ^0.8.6;

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

    constructor() {
        _addConsumer(msg.sender);
    }

    function isConsumer(address account) public view returns (bool) {
        return consumers.has(account);
    }

    function addConsumer(address account) public {
        _addConsumer(account);
    }

    function renounceConsumer() public onlyConsumer {
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
