// SPDX-License-Identifier: UNLICENCED

pragma solidity ^0.8.6;

/**
 * @title Roles
 * @dev Library for managing addresses assigned to a Role.
 */

library Roles {
    struct Role {
        mapping(address => bool) bearer;
    }

    function add(Role storage role, address account) internal {
        require(account != address(0), "INVALID: DEAD Address");
        require(!has(role, account), "INVALID: Account Have Role");

        role.bearer[account] = true;
    }

    function remove(Role storage role, address account) internal {
        require(account != address(0), "INVALID: DEAD Address");
        require(has(role, account), "INVALID: Account Have No Role");

        role.bearer[account] = false;
    }

    function has(Role storage role, address account)
        internal
        view
        returns (bool)
    {
        require(account != address(0), "INVALID: DEAD Address");
        return role.bearer[account];
    }
}
