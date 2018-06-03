// Contract to be tested
var Meshwar = artifacts.require("./Meshwar.sol");

// Test suite
contract('Meshwar', function(accounts) {
  var meshwarInstance;
  var rider = accounts[1];
  var riderName = "Abdullah Alghofaili";
  var destination = "Location of the destination";
  var ridePrice = 9;

  // Test case: check initial values
  it("should be initialized with empty values", function() {
    return Meshwar.deployed().then(function(instance) {
      return instance.getRide.call();
    }).then(function(data) {
      assert.equal(data[0], 0x0, "rider must be empty");
      assert.equal(data[1], '', "rider name must be empty");
      assert.equal(data[2], '', "destination must be empty");
      assert.equal(data[3].toNumber(), 0, "ride price must be zero");
    });
  });

  // Test case: sell an article
  it("should sell a ride", function() {
    return Meshwar.deployed().then(function(instance) {
      meshwarInstance = instance;
      return meshwarInstance.requestRide(riderName, destination, web3.toWei(ridePrice, "ether"), {
        from: rider
      });
    }).then(function() {
      return meshwarInstance.getRide.call();
    }).then(function(data) {
      assert.equal(data[0], rider, "rider must be " + rider);
      assert.equal(data[1], riderName, "rider name name must be " + riderName);
      assert.equal(data[2], destination, "rider destination must be " + destination);
      assert.equal(data[3].toNumber(), web3.toWei(ridePrice, "ether"), "rider price must be " + web3.toWei(ridePrice, "ether"));
    });
  });

  // Test case: should check events
  it("should trigger an event when a new ride is requested", function() {
    return Meshwar.deployed().then(function(instance) {
      meshwarInstance = instance;
      watcher = meshwarInstance.requestRideEvent();
      return meshwarInstance.requestRide(
        riderName,
        destination,
        web3.toWei(ridePrice, "ether"), {from: rider}
      );
    }).then(function(receipt) {
      assert.equal(receipt.logs.length, 1, "should have received one event");
      assert.equal(receipt.logs[0].args._rider, rider, "rider must be " + rider);
      assert.equal(receipt.logs[0].args._name, riderName, "rider name must be " + riderName);
      assert.equal(receipt.logs[0].args._price.toNumber(), web3.toWei(ridePrice, "ether"), "rider price must be " + web3.toWei(ridePrice, "ether"));
    });
  });
});
