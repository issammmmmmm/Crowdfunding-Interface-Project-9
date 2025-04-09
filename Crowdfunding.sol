// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Crowdfunding {
    address public owner;
    uint public goal;
    uint public deadline;
    uint public totalDonated;
    bool public fundsWithdrawn;

    mapping(address => uint) public donations;

    constructor(uint _goal, uint _durationInMinutes) {
        owner = msg.sender;
        goal = _goal;
        deadline = block.timestamp + (_durationInMinutes * 1 minutes);
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Not campaign owner");
        _;
    }

    modifier afterDeadline() {
        require(block.timestamp >= deadline, "Deadline not reached yet");
        _;
    }

    function donate() external payable {
        require(block.timestamp < deadline, "Campaign ended");
        require(msg.value > 0, "Must send ETH");

        donations[msg.sender] += msg.value;
        totalDonated += msg.value;
    }

    function withdraw() external onlyOwner afterDeadline {
        require(totalDonated >= goal, "Funding goal not reached");
        require(!fundsWithdrawn, "Already withdrawn");

        fundsWithdrawn = true;
        payable(owner).transfer(address(this).balance);
    }

    function refund() external afterDeadline {
        require(totalDonated < goal, "Goal was reached");
        uint amount = donations[msg.sender];
        require(amount > 0, "No donation to refund");

        donations[msg.sender] = 0;
        payable(msg.sender).transfer(amount);
    }

    
    function getTimeLeft() external view returns (uint) {
        if (block.timestamp >= deadline) {
            return 0;
        }
        return deadline - block.timestamp;
    }

    function getBalance() external view returns (uint) {
        return address(this).balance;
    }
}
