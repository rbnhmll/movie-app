angular.module('movieApp',[])
	.controller('movieFinder', function($http){
		var movieList = this; // scope controlled variable
		// var waitForMe;
		if(movieList.search === undefined){
			console.log("not grabbing");
			// movieList.search="Sigourney Weaver";
			fetch();	
		}

		movieList.change=function(){
			console.log('thingy!');
			console.log(movieList.search);
			if(movieList.waitForMe){
				clearTimeout(movieList.waitForMe);
			}
			movieList.waitForMe = setTimeout(fetch, 1800);
		};

		function fetch(){
			console.log(movieList.search);
			console.log("grabbing results!");
			$http.get("http://api.themoviedb.org/3/search/person?query=" 
				+movieList.search 
				+"&api_key=f0929f7d66dbc7eadf470f83ca7f2154")
			.success(function(response){
				movieList.details = response;
				console.log("returning Results!");
				infoBuilder(movieList.details);
			});
		}
		function infoBuilder(movieObject){
			console.log('entering infoBuilder');
			// get name
			movieList.actorName = movieObject.results[0].name;
			// get array of information
			movieList.relatedInfo = movieObject.results[0].known_for;
			console.log(movieList.relatedInfo);
			console.log('exiting infoBuilder');
		};
	});//end controller