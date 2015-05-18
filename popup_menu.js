var aesApp = angular.module('aesApp', []);

aesApp.controller('AESController', ['$scope', '$http', function($scope, $http) {
	    $scope.profiles = chrome.extension.getBackgroundPage().getProfiles();
	    
	    $scope.updateProfiles = function() {
		$http.get('http://cookie.stanford.edu:8000/api/v1/profiles/').
		success(function(data, status, headers, config) {
			chrome.extension.getBackgroundPage().setProfiles(data);
			$scope.profiles = chrome.extension.getBackgroundPage().getProfiles();
			console.log($scope.profiles);
		    }).
		error(function(data, status, headers, config) {
			console.log(status);
		    });
	    }

	    $scope.setProfile = function(id) {
		chrome.extension.getBackgroundPage().setProfile(id);
	    };
		

	}]);

