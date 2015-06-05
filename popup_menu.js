var frontend_server = chrome.extension.getBackgroundPage().frontend_server;
var frontend_base_url = 'http://' + frontend_server;

var GET_PROFILES_URL= frontend_base_url + '/api/v1/profiles/';
var CREATE_DESCRIPTOR_URL= frontend_base_url + '/api/v1/shapecookie/';
var CREATE_PROFILE_URL= frontend_base_url + '/atc_demo_ui/create_profile/';
var LIST_PROFILES_URL= frontend_base_url + '/atc_demo_ui/profiles/';

var aesApp = angular.module('aesApp', []);

aesApp.controller('AESController', ['$scope', '$http', function($scope, $http) {
	    $scope.profiles = chrome.extension.getBackgroundPage().getProfiles();
	    $scope.active_profile = chrome.extension.getBackgroundPage().active_profile;
	    
	    $scope.updateProfiles = function() {
		chrome.extension.getBackgroundPage().deleteProfiles();
		$scope.profiles = chrome.extension.getBackgroundPage().getProfiles();
		$http.get(GET_PROFILES_URL).
		success(function(data, status, headers, config) {
			for (var i = 0; i < data.length; i++) {
			    $scope.storeProfile(data[i]);
			}
		    }).
		error(function(data, status, headers, config) {
			console.log(status);
		    });
	    }

	    $scope.storeProfile = function(profile) { 
		var descriptor  = chrome.extension.getBackgroundPage().generateCookieDescriptor();
		var msg = {settings:profile.content, cookie_descriptor:{chip:descriptor.chip, seed:descriptor.seed}};
		console.log(msg);
		console.log(profile);
		$http.post(CREATE_DESCRIPTOR_URL, msg).
		success(function(data, status, headers, config) { 
			console.log("profile created,", status);
			chrome.extension.getBackgroundPage().storeProfile(profile, descriptor);
			// Update the list of available profiles every time we receive a new one.
			$scope.profiles = chrome.extension.getBackgroundPage().getProfiles();
		    }).
		error(function(data, status, headers, config) { 
			console.log("profile creation failed...",status);
		    });
	    };

	    $scope.activateProfile = function(id) {
		chrome.extension.getBackgroundPage().activateProfile(id);
		window.close();
	    };

	    $scope.stop = function() {
		chrome.extension.getBackgroundPage().stop();
		window.close();
	    }

	    $scope.setProxyBaseline = function() { 
		chrome.extension.getBackgroundPage().activateProxyBaseline();
		window.close();
	    }

	    $scope.createProfile = function() {
		chrome.tabs.create({url:CREATE_PROFILE_URL});
		window.close();
	    }

	    $scope.showProfiles = function() {
		chrome.tabs.create({url:LIST_PROFILES_URL});
		window.close();
	    }

	}]);

