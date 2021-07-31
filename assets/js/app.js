//app.js: -*- JavaScript-IDE -*-  DESCRIPTIVE TEXT.
//
// Copyright (c) 2021 Brian J. Fox Opus Logica, Inc.
// Author: Brian J. Fox (bfox@opuslogica.com)
// Birthdate: Mon Jul 26 04:33:45 2021.

var App = angular.module('eventsApp', []);
var Controllers = angular.module('app.controllers', []);
var Factories = angular.module('app.factories', []);
var Services = angular.module('app.services', []);

var GoogleAPIKey = "AIzaSyCW10IDscwwYD28SlzMUU_h8cC7XohAcZg";
var CPB_GoogleCalID  = "chillpointband.com_qjnnte2ajcvdk5f6b5fjqt7cog@group.calendar.google.com";
var ARB_GoogleCalID = "c_h3vgp0hj358ej3etno8na48v6o@group.calendar.google.com";
App.requires.push('app.controllers');
App.requires.push('app.factories');
App.requires.push('app.services');

Controllers.controller('eventsController', function($scope, $http) {
  $scope.events = [];

  $scope.update_events = function() {
    $scope.events = [];
    $scope.update_events_worker(CPB_GoogleCalID);
    $scope.update_events_worker(ARB_GoogleCalID);
    // setTimeout(function() { $scope.events.sort(function(a, b) { console.log("sorting..."); return (b.beg - a.beg); }); }, 2000);
  }

  $scope.update_events_worker = function(cal) {
    var yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    var calendar_url = "https://www.googleapis.com/calendar/v3/calendars/" + cal + "/events"
                      + "?key=" + GoogleAPIKey
                      + "&orderBy=startTime"
                      + "&singleEvents=true"
                      + "&timeMin=" + yesterday.toISOString();
    $http.get(calendar_url).then(function(response) {
      var calendar_data = response.data;
      var items = calendar_data.items;
      var len = items.length;
      var two_months = new Date();

      two_months.setMonth(two_months.getMonth() + 2);

      if (len > 8) len = 8;
      for (var i = 0; i < len; i++) {
        var item = calendar_data.items[i];
        var event = {
          what: item.summary, why: item.description, where: item.location, 
          beg: new Date(item.start.dateTime), fin: new Date(item.end.dateTime)
        };

        if (event.beg < two_months)
          $scope.events.push(event);
        else
          break;
      }

      var x = $scope.events.sort(function(a, b) {
        var a_beg = new Date(a.beg);
        var b_beg = new Date(b.beg);
        var diff = a_beg - b_beg;
        console.log("diff: " + diff);
        return (diff);
      });
      $scope.events = x;
    });
  }

  $scope.same_day = function(d1, d2) {
    return d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate();
  };

  $scope.classname_for_date = function(when) {
    var name = "ignore";
    var today = new Date();
    var tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    if ($scope.same_day(today, when))
      name = "today";
    else if ($scope.same_day(tomorrow, when))
      name = "tomorrow";

    return name;
  };

  $scope.go_there = function(place) {
    var dir_url = "https://google.com/maps/dir//" + encodeURIComponent(place);
    var loc_url = "https://maps.google.com/?q=" + encodeURIComponent(place);
    window.open(dir_url, "_blank");
  };

  $scope.more_info_or_go_there = function(place) {
    var venues = [
      { name: "Glass House", regex: /The Glass House/, url: "https://santabarbaravenues.com/property/the-glass-house/" },
      { name: "Night Lizard", regex: /Night Lizard/, url: "https://nightlizardbrewingcompany.com/" },
      { name: "Santa Barbara County Courthouse", regex: /.*County Courthouse Gardens/, url: "https://www.countyofsb.org/parks/day-use/courthouse-gardens.sbc" }
    ];

    var name = place.split(",")[0];
    var url = "https://maps.google.com/dir//" + encodeURIComponent(place);

    for (i = 0; i < venues.length; i++) {
      if (name.match(venues[i].regex)) {
        url = venues[i].url;
        break;
      }
    }

    window.open(url, "_blank");
  };

  $scope.update_events();
});

Controllers.controller('registerController', function($scope, $http) {
  $scope.registered = false;
  $scope.name = null;
  $scope.email = null;

  $scope.hide_register_elements = function() {
    $(".register-element").addClass("ng-hide");
  };

  $scope.saveForm = function() {
    var data = { name: $scope.name, email: $scope.email };
    $http.post('https://api.chillpointband.com/api/v1/users', JSON.stringify(data)).then(function(response) {
      console.log("outer");

      if (response.data) {
        $scope.message = "Contact received";
        $scope.hide_register_elements();
      }
    }, function(error) {
         console.log("Got an error", error);
       });
  };
});

Controllers.controller('contactController', function($scope) {
  $scope.contact = { name: "", phone: "", email: "", subject: "", message: "" };

  $scope.sendMessage = function() {
    console.log("SENDING MESSAGE: ", $scope.contact);
  };
});

