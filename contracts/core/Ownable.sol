//SPDX-License-Identifier: UNLICENCED

pragma solidity ^0.8.6;

contract Ownable {
    address private origOwner;

    event TransferOwnership(address indexed oldOwner, address indexed newOwner);

    modifier onlyOwner() {
        require(isOwner(), "INVALID: Unauthorized");
        _;
    }

    constructor() {
        origOwner = msg.sender;
        emit TransferOwnership(address(0), origOwner);
    }

    function owner() public view returns (address) {
        return origOwner;
    }

    function isOwner() public view returns (bool) {
        return msg.sender == origOwner;
    }

    function renounceOwnership() public onlyOwner {
        emit TransferOwnership(origOwner, address(0));
        origOwner = address(0);
    }

    function transferOwnership(address newOwner) public onlyOwner {
        _transferOwnership(newOwner);
    }

    function _transferOwnership(address newOwner) internal {
        require(newOwner != address(0), "INVALID: DEAD Address");
        emit TransferOwnership(origOwner, newOwner);
        origOwner = newOwner;
    }
}
