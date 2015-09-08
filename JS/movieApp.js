angular.module('movieApp',[])
	.controller('movieFinder', function($http){
		var movieList = this; // scope controlled variable
		var waitForMe;
		if(movieList.search===undefined){
			movieList.search="Sigourney Weaver";
			fetch();	
		}

		movieList.change=function(){
			if(waitForMe){
				clearTimeout(waitForMe);
			}
			waitForMe = setTimeout(fetch, 800);
		};

		function fetch(){
			$http.get("http://api.themoviedb.org/3/search/person?query=" 
				+movieList.search 
				+ "&api_key=f0929f7d66dbc7eadf470f83ca7f2154")
			.success(function(response){movieList.details = response;});
		}
	});//end controller