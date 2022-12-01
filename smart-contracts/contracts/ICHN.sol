//SPDX-License-Identifier: UNLICENCED
pragma solidity ^0.8.0;

interface ICHN{
    function balanceOf(address owner) external view returns(uint);
    function transfer(address to, uint amount) external returns(bool);
    function transferFrom(address from, address to, uint amount) external returns(bool);
    function approve(address spender, uint amount) external returns(bool);
}