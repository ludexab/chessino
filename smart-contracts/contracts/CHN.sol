//SPDX-License-Identifier: UNLICENCED
pragma solidity ^0.8.0;

contract CHN {
uint public totalSuply = 100000000000000000000000000;
string public name = "Chessino";
string public symbol = "CHN";
uint public decimals = 18;
address public owner;

mapping(address => uint)  public balances;
mapping(address => mapping(address => uint)) public allowance;
event Transfer(address from, address to, uint amount);
event Approval(address indexed owner, address indexed spender, uint amount);
event TransferFrom(address indexed from, address indexed to, uint amount);

constructor() {
    owner = msg.sender;
    balances[msg.sender] = totalSuply;
}

function balanceOf(address _owner) public view returns(uint){
    return balances[_owner];
    
}

function transfer(address to, uint amount) public returns(bool){
    require(balanceOf(msg.sender) >= amount);
    balances[msg.sender] -= amount;
    balances[to] += amount;
    emit Transfer(msg.sender, to, amount);
    return true;
}

function transferFrom(address from, address to, uint amount) public returns(bool){
    require(balanceOf(from) >= amount, "balance too low");
    require(allowance[from][msg.sender] >= amount, "Allowance too low");
    balances[from] -= amount;
    allowance[from][msg.sender] -= amount;
    balances[to] += amount;
    emit TransferFrom(from, msg.sender, amount);
    return true;

}

function approve(address spender, uint amount) public returns(bool){
    allowance[msg.sender][spender] = amount;
    emit Approval(msg.sender, spender, amount);
    return true;
}
}