//SPDX-License-Identifier: UNLICENCED
pragma solidity ^0.8.0;

import "./ICHN.sol";

contract Chessino {

    ICHN public chn;
    address public admin;

    address [] public winnersAddresses;
    uint256[] public winnersBalances;
    address [] public stakersAddresses;
    uint256[] public stakersBalances;

    event StakeSuccessful(address user,  uint amount);
    event PayoutDone(uint256 totalWinners, uint256 totalPayoutAmount);
    event WinnerSet(address winner, uint256 amount);

    constructor ( address _chnAddress) {
        chn = ICHN(_chnAddress);
        admin = msg.sender;
    }

    function setNewAdmin(address _admin) public returns(bool){
        require(msg.sender == admin);
        admin = _admin;
        return true;
    }

    function makeStake(uint _amount) public returns(bool){
        chn.transferFrom(msg.sender, admin, _amount);
        stakersAddresses.push(msg.sender);
        stakersBalances.push(_amount);
        emit StakeSuccessful(msg.sender, _amount);
        return true;
    }


    function setWinners(uint256 amount) public {
        bool hasStaked = checkAddressInArray(stakersAddresses, msg.sender);
        require(hasStaked, "Only stakers can win");
        winnersAddresses.push(msg.sender);
        winnersBalances.push(amount);
        emit WinnerSet(msg.sender, amount);
    }

    function payoutWinners() public {
        require(msg.sender == admin, "only admin can pay winners");
        uint256 totalPayoutAmount = getPendingPayoutAmount();
        uint256 totalWinners = winnersAddresses.length;
        for (uint i=0; i < totalWinners; i++){
            chn.transferFrom(admin, winnersAddresses[i], winnersBalances[i]);
        }

        delete winnersAddresses;
        delete winnersBalances;
        delete stakersAddresses;
        delete stakersBalances;
        emit PayoutDone(totalWinners, totalPayoutAmount);
        
    }

    function getPendingPayoutAmount() public view returns(uint256){
        uint256 totalPayoutAmount = 0;
        for (uint i=0; i < winnersBalances.length; i++){
            totalPayoutAmount += winnersBalances[i];
        }
        return totalPayoutAmount;
    }
    function getTotalStakes() public view returns(uint256){
        uint256 totalStakes = 0;
        for (uint i=0; i < stakersBalances.length; i++){
            totalStakes += stakersBalances[i];
        }
        return totalStakes;
    }

    function getWinnersDetails() public view returns( address[] memory, uint256[] memory ){       
        return (winnersAddresses, winnersBalances);
    }
    function getStakersDetails() public view returns( address[] memory, uint256[] memory ){       
        return (stakersAddresses, stakersBalances);
    }
    function getAdmin() public view returns( address){       
        return admin;
    }
    function checkAddressInArray(address[] memory _array, address _address ) public pure returns(bool){
        bool isIn = false;

        for(uint i=0; i<_array.length; i++){
            if(_array[i] == _address){
                isIn = true;
                break;
            }
        }
        return isIn;
    }
}