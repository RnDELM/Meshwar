pragma solidity ^0.4.18;

import "./Owner.sol";
import "./Users.sol";

contract Meshwar is Users {
  // Custom types
  struct Ride {
    uint id;
    address rider;
    address driver;
    string name;
    string pickup;
    string destination;
    uint start;
    uint end;
    uint256 price;
    bool startRide;
    bool paid;
  }

  // State variables
  mapping(uint => Ride) public rides;
  uint rideCounter;

  // Events
  event requestRideEvent (
    uint indexed _id,
    address indexed _rider,
    string _name
    );
  event acceptRideEvent (
    uint indexed _id,
    address indexed _rider,
    address indexed _driver,
    string _name
    );
    event startTripEvent (
      uint indexed _id,
      address indexed _rider,
      address indexed _driver,
      string _name,
      uint _start

      );
  event payForRideEvent (
    uint indexed _id,
    address indexed _rider,
    address indexed _driver,
    string _name,
    string _destination,
    uint256 _price
    );

  // sell an ride
  function requestRide(string _name, string _pickup, string _destination) public {
    // a new ride
    rideCounter++;

    // store this ride
    rides[rideCounter] = Ride(
         rideCounter,
         msg.sender,
         0x0,
         _name,
         _pickup,
         _destination,
         0,
         0,
         0,
         false,
         false
    );

    // trigger the event
    requestRideEvent(rideCounter, msg.sender, _name);
  }


  // fetch the number of rides in the contract
  function getNumberOfRides() public constant returns (uint) {
    return rideCounter;
  }

  // fetch and returns all ride IDs available for sale
  /* function getRidesRequest() onlyRiderAndDriver() public constant returns (uint[]) { */
  function getRidesRequest() public constant returns (uint[]) {
    // we check whether there is at least one ride
    if(rideCounter == 0) {
      return new uint[](0);
    }

    // prepare intermediary array
    uint[] memory rideIds = new uint[](rideCounter);

    uint numberOfRidesAvailable = 0;
    // iterate over rides
    for (uint i = 1; i <= rideCounter; i++) {
      rides[i].paid = false;
      // keep only the ID of rides not paid yet
       if (rides[i].paid == false || rides[i].driver == 0x0) {
        rideIds[numberOfRidesAvailable] = rides[i].id;
        numberOfRidesAvailable++;
      }
    }

    // copy the rideIds array into the smaller forRide array
    uint[] memory forRide = new uint[](numberOfRidesAvailable);
    for (uint j = 0; j < numberOfRidesAvailable; j++) {
      forRide[j] = rideIds[j];
    }
    return (forRide);
  }


  //acceptRide
  function acceptRide(uint _id) public {
    //set paid to false, since the drvier accepted the ride & did not get paid
    ride.paid = false;
    //we check whether there is a at least one ride
    require(rideCounter > 0);

    //we check whether the ride exists
    require(_id > 0 && _id <= rideCounter);

    //we retrieve the rideRequest
    Ride storage ride = rides[_id];

    //we check whether the ride has not already been accepted by a driver
    require(ride.driver == 0x0);

    //we don't allow the rider to accept his/her own rideRequest
    require(ride.rider != msg.sender);

    // keep driver's information
    ride.driver = msg.sender;


    // trigger the event
  //  acceptRideEvent(_id, ride.rider, ride.driver, ride.name);

  }

  // startTrip
  function startTrip(uint _id, uint _start) public {

    //require false, since the drvier accepted the ride & did not get paid
    ride.paid = false;
    // we check whether there is at least one ride
    require(rideCounter > 0);

    // we check whether the ride exists
    require(_id > 0 && _id <= rideCounter);

    // we retrieve the rideRequest
    Ride storage ride = rides[_id];

    ride.start = _start;

    // we don't allow the driver to start his/her own trip
    require(ride.driver == msg.sender);

    // we check whether there is an ride
    require(ride.rider != 0x0);

    //set the start trip to false
    ride.startRide = true;
    startTripEvent(_id, ride.rider, ride.driver, ride.name, ride.start);
  }

  // payForRide
  function payForRide(uint _id, uint _end) payable public {

    // we check whether there is at least one ride
    require(rideCounter > 0);

    // we check whether the ride exists
    require(_id > 0 && _id <= rideCounter);

    // we retrieve the ride
    Ride storage ride = rides[_id];
    ride.end = _end;
    ride.price = (((ride.end - ride.start))*10000000000);

    // keep rider's information
    ride.rider = msg.sender;

    // the rider can buy the Ride
    ride.driver.transfer(msg.value);

    /* ride.driver.transfer(msg.value); */

    //bool returns true to hide the button in the UI
    ride.paid = true;

    // trigger the event
    payForRideEvent(_id, ride.rider, ride.driver, ride.name, ride.destination, ride.price);
  }

  // kill the smart contract
  function kill() onlyByOwner {
    selfdestruct(owner);
  }

}
