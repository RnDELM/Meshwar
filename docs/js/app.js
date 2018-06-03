//Abdullah Alghofaili
//Meshwar dapp (uber Like) using Ethereum BlockChain

App = {
  web3Provider: null,
  contracts: {},
  account: 0x0,
  loading: false,

  init: function() {
    return App.initWeb3();
  },

  initWeb3: function() {
    // Initialize web3 and set the provider to the testRPC.
    if (typeof web3 !== 'undefined') {
      //reuse the provider of the Web3 object injected by Metamask
      App.web3Provider = web3.currentProvider;
    } else {
      // set the provider you want from Web3.providers
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
    }
    web3 = new Web3(App.web3Provider);
    
    App.displayAccountInfo();
    return App.initContract();
  },

  displayAccountInfo: function() {
    web3.eth.getCoinbase(function(err, account) {
      if (err === null) {
        App.account = account;
        $("#account").text(account);
        web3.eth.getBalance(account, function(err, balance) {
          if (err === null) {
            $("#accountBalance").text(web3.fromWei(balance, "ether") + " ETH");
          }
        });
      }
    });
  },
  initContract: function() {
    $.getJSON('Meshwar.json', function(meshwarArtifact) {
      // Get the necessary contract artifact file and use it to instantiate a truffle contract abstraction.
      App.contracts.Meshwar = TruffleContract(meshwarArtifact);

      // Set the provider for our contract.
      App.contracts.Meshwar.setProvider(App.web3Provider);

      //Listen to events
      App.listenToEvents();

      // Retrieve the ride from the smart contract
      return App.reloadRides();
    });
  },

  reloadRides: function() {
    // avoid reentry
    if (App.loading) {
      return;
    }
    App.loading = true;

    // refresh account information because the balance may have changed
    App.displayAccountInfo();

    var meshwarInstance;

    App.contracts.Meshwar.deployed().then(function(instance) {
      meshwarInstance = instance;
      return meshwarInstance.getRidesRequest();
    }).then(function(rideIds) {
      // Retrieve and clear the article placeholder
      var ridesRow = $('#ridesRow');
      ridesRow.empty();

      for (var i = 0; i < rideIds.length; i++) {
        var rideId = rideIds[i];
        meshwarInstance.rides(rideId).then(function(ride) {
          App.displayRide(
            ride[0],
            ride[1],
            ride[2],//
            ride[3],
            ride[4],
            ride[5],
            ride[6],
            ride[7],//
            ride[8],
            ride[9],
            ride[10]
          );
        });
      }

      App.loading = true;
    }).catch(function(err) {
      console.log(err.message);
      App.loading = false;
    });
  },

  getTime: function(){
    return Date.now();
  },


///////////////reload driversResquest///////////////////////
  // reloadRequests: function() {
  //   // avoid reentry
  //   if (App.loading) {
  //     return;
  //   }
  //   App.loading = true;
  //   // refresh account information because the balance may have changed
  //   App.displayAccountInfo();
  //   var meshwarInstance;
  //
  //   App.contracts.Meshwar.deployed().then(function(instance) {
  //     meshwarInstance = instance;
  //     return meshwarInstance.getRequestDriver();
  //   }).then(function(driverRequest) {
  //     // Retrieve and clear the ride placeholder
  //     var driversResquestRow = $('#driversResquestRow');
  //     driversResquestRow.empty();
  //
  //     for (var i = 0; i < driversAddresses.length; i++) {
  //
  //       meshwarInstance.drivers(_user).then(function(drivers) {
  //         App.displayRequest(
  //           ride[0],
  //           ride[1],
  //           ride[2]
  //         );
  //       });
  //     }
  //     App.loading = false;
  //   }).catch(function(err) {
  //     console.log(err.message);
  //     App.loading = false;
  //   });
  // },

  displayRide: function(id, rider, driver, name, pickup, destination, start, end, price, startRide, paid) {

    // Retrieve the ride placeholder
    var ridesRow = $('#ridesRow');


    var cost = ((( Date.now() - start))*1000000000)
    // var cost = ((end - start))

    console.log('COST ' + cost);
    var etherPrice = web3.fromWei(cost, "ether");
    // Retrieve and fill the ride template
    var rideTemplate = $('#rideTemplate');
    var spinner = $('#spinner');
    var search = $('#search');
    rideTemplate.find('.panel-title').text(name);
    rideTemplate.find('.ride-Pickup').text(pickup);
    rideTemplate.find('.ride-destination').text(destination);
    rideTemplate.find('.btn-accept').attr('data-id', id);
    rideTemplate.find('.btn-startTrip').attr('data-id', id);
    rideTemplate.find('.btn-end').attr('data-id', id);
    rideTemplate.find('.btn-pay').attr('data-id', id);
    rideTemplate.find('.btn-pay').attr('data-value', etherPrice);
    if (paid){
      rideTemplate.find('.ride-price').text(etherPrice + " ETH");
    }else {
      rideTemplate.find('.ride-price').hide();
    }

    console.log(startRide);
    console.log(paid);
    console.log('START time is' + ' ' + (start));
    console.log('END time is' + ' ' + (end));
    console.log('total time is' + ' ' + (end - start));
    console.log("price var is   " + price);
    console.log(pickup);

    // var showStartTrip = rideTemplate.find('.btn-startTrip').show();
    // var hideStartTrip = rideTemplate.find('.btn-startTrip').hide();
    //
    // var showPay = rideTemplate.find('.btn-pay').show();
    // var hidePay = rideTemplate.find('.btn-pay').hide();
    //
    // var showAccept = rideTemplate.find('.btn-accept').show();
    // var hideAccept = rideTemplate.find('.btn-accept').hide();

    // rider?
    if (rider == App.account) {
      rideTemplate.find('.rider').text("You");
      rideTemplate.find('.btn-accept').hide();
      rideTemplate.find('.btn-startTrip').hide();
      rideTemplate.find('.btn-pay').show();
    } else{
      rideTemplate.find('.rider').text(rider);
      rideTemplate.find('.btn-accept').show();
      rideTemplate.find('.btn-pay').hide();
    }
    // driver?
    if (driver == App.account) {
      rideTemplate.find('.driver').text("You");

    } else if (driver == 0x0) {
      rideTemplate.find('.driver').text("No One Yet");
    } else {
      rideTemplate.find('.driver').text(driver);
    }
    var theDriver = rideTemplate.find('.driver').text();
    if (theDriver == "You"){
      rideTemplate.find('.btn-startTrip').show();
    }else {
      rideTemplate.find('.btn-startTrip').hide();
    }
  //   if (rider == App.account){
  //     if (driver == 0x0){
  //       rideTemplate.find('.status').text("waiting for a driver");
  //     }
  //     if (driver != 0x0 && !startRide){
  //       rideTemplate.find('.status').text("A driver has accepted your ride");
  //     }
  //     if (driver !=0x0 && startRide){
  //       rideTemplate.find('.status').text("your trip has started");
  //     }
  //     if (driver != 0x0 && paid){
  //       rideTemplate.find('.status').text("End & Paid!");
  //     } else {
  //       rideTemplate.find('.status').hide();
  //     }
  // }

    //hide the accept button if i am the rider or the ride has already been accepted
    if (rider == App.account || driver != 0x0) {
      rideTemplate.find('.btn-accept').hide();
      // search.hide();

    }

    if (rider == App.account && driver == 0x0) {
      spinner.show();
      search.hide();
    }
    if (driver == App.account) {
      spinner.hide();
      search.show();

    }

    //hide the pay button if paid
    if (paid == true || startRide == false){
      rideTemplate.find('.btn-pay').hide();
    }

    if (startRide == true || driver == 0x0){
      rideTemplate.find('.btn-startTrip').hide();
    }

    // add this new ride
    ridesRow.append(rideTemplate.html());
  },

  /////////////////////

  ////////////display the driverRequest////////////////
  // displayRequest: function(usrDriver, name, isDriver) {
  //
  //   // Retrieve the ride placeholder
  //   var driversResquestRow = $('#driversResquestRow');
  //
  //
  //   // Retrieve and fill the ride template
  //   var newDriverTemplate = $('#newDriverTemplate');
  //   newDriverTemplate.find('.panel-title').text(name);
  //   // newDriverTemplate.find('.newDriver-description').text(description);
  //   newDriverTemplate.find('.btn-accept').attr('data-id', usrDriver );
  //
  //
  //   // add this new ride
  //   driversResquestRow.append(newDriverTemplate.html());
  // },



  requestRide: function() {
    // retrieve details of the ride
    var _rider_name = $("#Rider_Name").val();
    var _pickup = $("#ride_Pickup").val();
    var _destination = $("#ride_destination").val();

    // var _price = web3.toWei(parseFloat($("#ride_price").val() || 0), "ether");
    if ((_rider_name.trim() == '')) {
      // nothing to sell
      return false;
    }
    App.contracts.Meshwar.deployed().then(function(instance) {
      return instance.requestRide(_rider_name, _pickup, _destination, {
        from: App.account,
        gas: 500000
      });
    }).then(function(result) {
    }).catch(function(err) {
      console.error(err);
    });
  },

  ///////requestto be a Driver//////////
  // requestDriver: function() {
  //   // retrieve details of the ride
  //   var _driver_name = $("#Driver_Name").val();
  //   // var _description = $("#Driver__description").val();
  //   if ((_driver_name.trim() == '')) {
  //     // nothing to sell
  //     return false;
  //   }
  //   App.contracts.Meshwar.deployed().then(function(instance) {
  //     return instance.requestDriver(_driver_name, {
  //       from: App.account,
  //       gas: 500000
  //     });
  //   }).then(function(result) {
  //   }).catch(function(err) {
  //     console.error(err);
  //   });
  // },


  becomeDriver: function() {
    // retrieve details of the ride
    var _wallet_addr = $("#wallet_addr").val();

    App.contracts.Meshwar.deployed().then(function(instance) {
      return instance.becomeDriver(_wallet_addr, {
        from: App.account,
        gas: 500000
      });
    }).then(function(result) {
    }).catch(function(err) {
      console.error(err);
    });
  },
  // Listen for events raised from the contract
  listenToEvents: function() {
    App.contracts.Meshwar.deployed().then(function(instance) {

      instance.requestRideEvent({}, {
        fromBlock: 0,
        toBlock: 'latest'
      }).watch(function(error, event) {
        if (!error) {
          $("#events").append('<li class="list-group-item">' + event.args._name + ' needs a ride!' + '</li>');
        } else {
          console.error(error);
        }
        App.reloadRides();
      });

      instance.acceptRideEvent({}, {
        fromBlock: 0,
        toBlock: 'latest'
      }).watch(function(error, event) {
        if (!error) {
          $("#events").append('<li class="list-group-item">' + event.args._driver + ' Accepted a ride for ' + event.args._name + '</li>');
        } else {
          console.error(error);
        }
        App.reloadRides();
      });
      instance.startTripEvent({}, {
        fromBlock: 0,
        toBlock: 'latest'
      }).watch(function(error, event) {
        $("#events").append('<li class="list-group-item">' + event.args._rider + 'has started a ride, the start time is' + event.args._start + ' ' + '</li>');
        App.reloadRides();
      });

      instance.payForRideEvent({}, {
        fromBlock: 0,
        toBlock: 'latest'
      }).watch(function(error, event) {
        if (!error) {
          $("#events").append('<li class="list-group-item">' + event.args._name +
           ' Paid for a ride to ' + event.args._destination + ' with ' + event.args._driver + '</li>');
         } else {
          console.error(error);
        }
        App.reloadRides();
      });
    });
  },


  acceptRide: function() {
    event.preventDefault();

    // retrieve the ride
    var _rideId = $(event.target).data('id');

    App.contracts.Meshwar.deployed().then(function(instance) {
      return instance.acceptRide(_rideId, {
        from: App.account,
        gas: 500000
      });
    }).then(function(result) {

    }).catch(function(err) {
      console.error(err);
    });
  },


  startTrip: function() {
    event.preventDefault();

    // retrieve the ride
    var _rideId = $(event.target).data('id');
    var _start = Date.now();
    console.log('START time is' + ' ' + _start)
    App.contracts.Meshwar.deployed().then(function(instance) {
      return instance.startTrip(_rideId, _start, {
        from: App.account,
        gas: 500000
      });
    }).then(function(result) {

    }).catch(function(err) {
      console.error(err);
    });
  },

  // endTrip: function() {
  //   event.preventDefault();
  //
  //   // retrieve the ride
  //   var _rideId = $(event.target).data('id');
  //   var _end = Date.now();
  //   console.log('END time is' + ' ' + _end)
  //   App.contracts.Meshwar.deployed().then(function(instance) {
  //     return instance.endTrip(_rideId, _end, {
  //       from: App.account,
  //       gas: 500000
  //     });
  //   }).then(function(result) {
  //
  //   }).catch(function(err) {
  //     console.error(err);
  //   });
  // },

  payForRide: function() {
    event.preventDefault();


    // retrieve the RIDE price
    var _rideId = $(event.target).data('id');
    var _price = parseFloat($(event.target).data('value'));
    var _end = Date.now();
    console.log('END time is' + ' ' + _end)


    App.contracts.Meshwar.deployed().then(function(instance) {
      return instance.payForRide(_rideId,_end, {
        from: App.account,
        value: web3.toWei(_price, "ether"),
        gas: 500000
      });
    }).then(function(result) {
      }).catch(function(err) {
        console.error(err);
      });
    },
  };

  $(function() {
    $(window).load(function() {
      App.init();
    });
  });
