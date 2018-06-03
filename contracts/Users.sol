pragma solidity ^0.4.11;

import "./Owner.sol";

contract Users is Owner{

  struct User {
    /* uint usrId; */
    address usrDriver;
    string name;
    bool isDriver;
  }

  mapping(address => User) drivers;
  address[] public driversAddresses;

  modifier onlyByDriver(){
    if(drivers[msg.sender].isDriver == true){
      _;
    } else{
      revert();
    }
  }
  // request to become a Driver
  function requestDriver(string _name) public {
    address _user = msg.sender;

    drivers[_user] = User(msg.sender,_name, false);
    driversAddresses.push(_user);
  }

  //become driver
//  function becomeDriver (address _newDriver) onlyByOwner() public{
  function becomeDriver (address _newDriver) public{
    if (drivers[_newDriver].isDriver != true){
      drivers[_newDriver].isDriver = true;
    }
  }
  function getRequestDriver(address _user) public constant returns(address usrDriver, string name, bool isDriver ){
    return(
      drivers[_user].usrDriver,
      drivers[_user].name,
      drivers[_user].isDriver
      );
    }


}
