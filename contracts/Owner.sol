pragma solidity ^0.4.11;


contract Owner {
  // State variable
  address owner;

  // Modifiers
  modifier onlyByOwner() {
    require(msg.sender == owner);
    _;
  }
  // constructor
  function Owner() {
    owner = msg.sender;
  }
  function getOwner() returns (address xowner){
    return owner;
  }
}
