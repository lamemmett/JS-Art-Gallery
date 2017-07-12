//	Emmett Lam
//
//	This file handles the retrieval of data and page event binding

(function() {
	// Source URL for IDs
	var URL = "https://appsheettest1.azurewebsites.net/sample/art";
	
	// Array to store list of IDs
	var ID_Numbers = [];
	
	// Number of IDs to pull per batch
	var batchCount = 15;
	
	// Tracker for total number of retrieved IDs
	var numRetrievedIDs = 0;
	
	// Tracking flag
	var isFetching = false;
	
	// Make angular happy
	var app = angular.module("myApp", []);
	app.controller("artDisplayCtrl", function($scope) {
		$scope.artPieces = [];
	});
	
	// On-Load:
	//		- Fetch and store all the art IDs from URL
	// After ID fetch:
	//		- Use IDs to retrieve first batch of art pieces and display them on screen
	// After first batch fetch
	//		- Bind scroll event handler to pull in more pieces when window scrolled to bottom of screen
	$(document).ready(function() {
		
		// Fetch IDs 
		$.getJSON(URL, function(data) {        
			ID_Numbers = data;
			
			// Retrieve the first batch of art pieces
			retrieveNextBatch(function() {
				
				// Scroll handler to load more art
				$(window).scroll(function() {
					if (!isFetching) {
						if($(window).scrollTop() + $(window).height() > $(document).height() - 100) {
							retrieveNextBatch();
						}
					}
				});
			});
		});
	});
	
	// Fetches the next batch of art pieces
	function retrieveNextBatch(callback) {
		// Disable repeated calls
		isFetching = true;
		
		$(".loading-spinner-overlay").fadeIn(500);
		
		var scope = angular.element($('[ng-controller="artDisplayCtrl"]')).scope();
		
		// Retrieve the initial lot of art IDs and append to the bound angular array
		for (let i = 0; (i < batchCount) && (numRetrievedIDs < ID_Numbers.length); i++) {
			retrieveID(ID_Numbers[numRetrievedIDs], function(data) {
				scope.artPieces.push(data);
				scope.$apply();
				
				// Hide spinner and re-enable after last fetch of the batch has been completed
				if ( (i == batchCount - 1) || (numRetrievedIDs == ID_Numbers.length - 1) ) {
					$(".loading-spinner-overlay").fadeOut(500);
					
					// Re-enable fetching
					isFetching = false;
					
					if (callback) {
						callback();
					}
				}
			});
			numRetrievedIDs++;
		}
	}

	// Returns an object containing the data for the specified art ID
	function retrieveID(ID, callback) {
		$.getJSON(URL + '/' + ID, function(data) {
			callback(data);
		});
	}
})();