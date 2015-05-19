var aesApp = angular.module('aesApp', []);

aesApp.controller('AESController', ['$scope', '$http', function($scope, $http) {
	    $scope.profiles = chrome.extension.getBackgroundPage().getProfiles();
	    
	    $scope.updateProfiles = function() {
		chrome.extension.getBackgroundPage().deleteProfiles();
		$scope.profiles = chrome.extension.getBackgroundPage().getProfiles();
		$http.get('http://cookie.stanford.edu:8000/api/v1/profiles/').
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
		$http.post('http://cookie.stanford.edu:8000/api/v1/shapecookie/', msg).
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
		chrome.tabs.create({url:'http://cookie.stanford.edu:8000/atc_demo_ui/create_profile/'});
		window.close();
	    }

	    $scope.showProfiles = function() {
		chrome.tabs.create({url:'http://cookie.stanford.edu:8000/atc_demo_ui/profiles/'});
		window.close();
	    }

	}]);

