  //
  // var map;


  function initMap() {
    var riyadh = {lat: 24.822, lng: 46.593};
    var map = new google.maps.Map(document.getElementById('map'), {
      mapTypeControl: false,
      zoom: 6,
      mapTypeId: 'roadmap',
      zoomControl: true,
      mapTypeControl: false,
      scaleControl: false,
      streetViewControl: false,
      rotateControl: false,
      fullscreenControl: true,

    });


    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(function(position) {
        var pos = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };

        var marker = new google.maps.Marker({
          position: {lat: position.coords.latitude, lng: position.coords.longitude},
          map: map
        });

        map.setCenter(pos);

        // if (!pos.formatted_address){
        //   document.getElementById('ride_Pickup').value = position.coords.latitude +' '+ position.coords.longitude;
        //
        // } else {
        //   document.getElementById('ride_Pickup').value = pos.formatted_address;
        // }


      }, function() {
        handleLocationError(true, infoWindow, map.getCenter());
      });
    } else {
      // Browser doesn't support Geolocation
      handleLocationError(false, infoWindow, map.getCenter());
    }


  function handleLocationError(browserHasGeolocation, infoWindow, pos) {

    infoWindow.setPosition(pos);
    infoWindow.setContent(browserHasGeolocation ?
                          'Error: The Geolocation service failed.' :
                          'Error: Your browser doesn\'t support geolocation.');
    infoWindow.open(map);
  }


    new AutocompleteDirectionsHandler(map);



}
/**
 * @constructor
*/
function AutocompleteDirectionsHandler(map) {
  this.map = map;
  this.originPlaceId = null;
  this.destinationPlaceId = null;
  this.travelMode = 'DRIVING';
  var originInput = document.getElementById('ride_Pickup');
  var destinationInput = document.getElementById('ride_destination');
  // var modeSelector = document.getElementById('mode-selector');
  this.directionsService = new google.maps.DirectionsService;
  this.directionsDisplay = new google.maps.DirectionsRenderer;
  this.directionsDisplay.setMap(map);

  var originAutocomplete = new google.maps.places.Autocomplete(
    originInput, {placeIdOnly: true});
  var destinationAutocomplete = new google.maps.places.Autocomplete(
    destinationInput, {placeIdOnly: true});

    this.setupPlaceChangedListener(originAutocomplete, 'ORIG');
    this.setupPlaceChangedListener(destinationAutocomplete, 'DEST');
  }

  AutocompleteDirectionsHandler.prototype.setupPlaceChangedListener = function(autocomplete, mode) {
    var me = this;
    autocomplete.bindTo('bounds', this.map);
    autocomplete.addListener('place_changed', function() {
      var place = autocomplete.getPlace();
      if (!place.place_id) {
        window.alert("Please select an option from the dropdown list.");
        return;
      }
      if (mode === 'ORIG') {
        me.originPlaceId = place.place_id;
      } else {
        me.destinationPlaceId = place.place_id;
      }
      me.route();

    });
    //calculate the distance
    me.directionsDisplay.addListener('directions_changed', function() {
      computeTotalDistance(me.directionsDisplay.getDirections());
    });
  };

  AutocompleteDirectionsHandler.prototype.route = function() {
    if (!this.originPlaceId || !this.destinationPlaceId) {
      return;
    }
    var me = this;

    this.directionsService.route({
      origin: {'placeId': this.originPlaceId},
      destination: {'placeId': this.destinationPlaceId},
      travelMode: this.travelMode
    }, function(response, status) {
      if (status === 'OK') {
        me.directionsDisplay.setDirections(response);
      } else {
        window.alert('Directions request failed due to ' + status);
      }
    });
  };


  function computeTotalDistance(result) {
    var total = 0;
    var myroute = result.routes[0];
    for (var i = 0; i < myroute.legs.length; i++) {
      total += myroute.legs[i].distance.value;
    }
    total = total / 1000;
    document.getElementById('total').innerHTML = total + ' km';
  }



  function createMarker(place) {

    var placeLoc = place.geometry.location;
    var marker = new google.maps.Marker({
      map: map,
      position: place.geometry.location
    });


    google.maps.event.addListener(marker, 'click', function() {
      infowindow.setContent(place.name);
      infowindow.open(map, this);
    });

  }

function computeTotalDistance(result) {
  var total = 0;
  var duration = 0;
  var myroute = result.routes[0];
  for (var i = 0; i < myroute.legs.length; i++) {
    total += myroute.legs[i].distance.value;
  }
  for (var i = 0; i < myroute.legs.length; i++) {
    duration += myroute.legs[i].duration.value;
  }
  total = total / 1000;
  duration = duration / 60;

  document.getElementById('total').innerHTML = 'Total distance ' + Number((total).toFixed(1)) + ' km '+ 'in ' + parseInt(duration) + ' minutes';

}


var search=$("#search");
var map=$("#map");
var spinner=$("#spinner");

var rides = $("#ridesRow");
// toppag.css({position:"relative"});
// pag.css({position:"relative"});


// $(window).scroll(function () {
//     var scroll=$(this).scrollTop();
//     var last;
//
//     if(scroll <= rides.offset().top){
//    		search.hide();
//     }else {
//       search.show();
//     }
//     // if(scroll <= map.offset().top){
//     //   search.show();
//     // }
//
// });
