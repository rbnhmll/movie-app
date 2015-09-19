// defining the global variable
var picApp = {};

// defining global variables for prattID and userID ???
// value is an empty string
var prattID = '';
var userID = '';

// defining an object named locals
picApp.locals = {
	canvas: document.getElementById('canvas'), // canvas html element
	context: canvas.getContext('2d'), // creates a 2D canvas ???
	video: document.getElementById('video'), // video html element
	videoObj: { 'video' : true }, // ???
	token: '32e951b2c6911fc', // imgur ID
	fppkey: '05c2fb9e5793b571dcc0e7593d8e1e60', // f++ key
	fppscrt: 'JSe2lo3yHWb1s7ZELUtpjSJRanZVUlod', // f++ secret
	imgurImg: '', // empty string
	errBack: function(err) {
		// log error message
		console.log('Video capture error.');
		// hide snap button
		$('#snap').fadeOut().addClass('hide');
		// hide guideWrapper
		$('.guideWrapper').fadeOut().addClass('hide');
		// darken picSsection div
		$('.picSection').addClass('darken');	
		// show error div
		$('.error').fadeIn().removeClass('hide');
		// insert error message
		$('.errorMessage').html('OOPS! Looks like the camera is having trouble capturing your image. Let\'s try this again.');
		// show reset button
		$('#reset').fadeIn().removeClass('hide');
		// reload page on click
		$('#reset').on('click', function() {
			location.reload();
		});
	}
};

// defining a method named canvas
// this method is called by the init function
// this method takes the stream from the camera and puts it into a video player ???
picApp.canvas = function() {
	if (navigator.getUserMedia) { // standard
		navigator.getUserMedia(picApp.locals.videoObj, function(stream) {
			picApp.locals.video.src = stream;
			picApp.locals.video.play();
		}, picApp.locals.errBack);
	} else if (navigator.webkitGetUserMedia) { // for webkit 
		navigator.webkitGetUserMedia(picApp.locals.videoObj, function(stream) {
			picApp.locals.video.src = window.URL.createObjectURL(stream);
			picApp.locals.video.play();
			picApp.stream = stream;
		}, picApp.locals.errBack);
	} else if (navigator.mozGetUserMedia) { // for moz
		navigator.mozGetUserMedia(picApp.locals.videoObj, function(stream) {
			picApp.locals.video.src = window.URL.createObjectURL(stream);
			picApp.locals.video.play();
			picApp.stream = stream;
		}, picApp.locals.errBack);
	}
};

// defining a method named takePic 
// this method captures a local image when the snap button is clicked
// this method is called by the init function
picApp.takePic = function() {
	$('#snap').on('click', function() {
		// create a canvas 640px wide by 480px high
		picApp.locals.context.drawImage(video, 0, 0, 640, 480); // does this have to be fixed pixels ???
		// pause the video player 
		picApp.locals.video.pause();
		// stop the from the laptop cam
		picApp.stream.stop();
		// define a variable called vibePhoto to hold the image captured on canvas
		picApp.locals.vibePhoto = picApp.convert(picApp.locals.canvas);
		// hide picSection 
		$('.picSection').fadeOut().addClass('hide');
		// hide snap button
		$('#snap').fadeOut().addClass('hide');
		// show preview
		$('.preview').fadeIn().addClass('show');
		// show the image captured on canvas
		$('.resultImg').html(picApp.locals.vibePhoto);
		// call the uploadPic method
		picApp.uploadPic();
	});
};

// defining a method named convert
// this method converts the local image to a jpeg
// this method is called by ???
picApp.convert = function(canvas) {
	var image = new Image();
	image.src = canvas.toDataURL('image/jpeg');
	return image;
};

// defining a method named uploadPic
// this method uploads the jpeg to imgur 
// this method is called by the takePic method
picApp.uploadPic = function() {
	var $img = $('img');
	localStorage.doUpload = true;
	localStorage.imageBase64 = $img.attr('src').replace(/.*,/, '');
	// ajax request to imgur API
	$.ajax({
	  url: 'https://api.imgur.com/3/image',
	  method: 'POST',
	  headers: {
	    Authorization: 'Client-ID ' + picApp.locals.token,
	    Accept: 'application/json'
	  },
	  data: {
	    image: localStorage.imageBase64,
	    type: 'base64'
	  },
	  // if image uploaded to imgur successfully do the following
	  success: function(result) {
	  	picApp.deleteLink = result.data.deletehash;
	    var id = result.data.id;
	    var link = 'http://i.imgur.com/' + id + '.png';
	    picApp.locals.imgurImg = result.data.id;
	    // log success message
	    console.log('Your image has been uploaded to Imgur')
	    // calling the submitPratt method
	    picApp.submitPratt();
	    // calling the submitFace method, passing link to the uploaded image
	    picApp.submitFace(link);
	  },
	  // if image is not uploaded to imgur successfully do the following
	  error: function() {
	  	// console log
	  	console.log('Error uploading image to Imgur');
	  	// hide load div
	  	$('.load').fadeOut().addClass('hide');
	  	// hide snap button
	  	$('#snap').fadeOut().addClass('hide');
	  	// darken resultImg div
		$('.resultImg').addClass('darken');
		// increase opacity of resultImg img
		$('.resultImg > img').addClass('opacity');
	  	// show error div
	  	$('.error').fadeIn().removeClass('hide');
	  	// insert error message
	  	$('.errorMessage').html('OOPS! Looks like we\'re having trouble uploading your image. Let\'s try this again.');
	  	// show reset button
	  	$('#reset').fadeIn().removeClass('hide');
	  	// reload page on click
	  	$('#reset').on('click', function() {
	  		location.reload();
	  	});
	  }
	});
};

// defining a method named submitPratt
// this method submits proto Pratt image to f++ and returns some data
// this method is called by the uploadPic method
picApp.submitPratt = function() {
	// start of ajax request to f++ api
	$.ajax({
		url: 'https://apius.faceplusplus.com/v2/detection/detect',
	    // type of request i.e. we want to get data
	    type: 'GET',
	    // the data we are sending
	    data: {
	      // submitting the url of the proto Pratt image
	      url : 'https://upload.wikimedia.org/wikipedia/commons/a/aa/Chris_Pratt_-_Guardians_of_the_Galaxy_premiere_-_July_2014_(cropped).jpg',
	      // calling the fppkey from the locals object stored in the global variable
	      api_key : picApp.locals.fppkey,
	      // calling the fppsecret from the locals object stored in the global variable
	      api_secret : picApp.locals.fppscrt
	    },
	    // what to do when the jpeg is successfully submitted
	    success: function(data) {
	    	console.log('Chris Pratt\'s image has been submitted for Face++ analysis');
	    	// console logging Chris Pratt's face data
	    	console.log(data);
	    	// console logging Chris Pratt's face_id
	    	console.log(data.face[0].face_id);
	    	// giving the global variable prattID a value of Chris Pratt's face_id
	    	prattID = data.face[0].face_id;
	    }
	});
};

// defining a method named submitFace
// this method submits the user's jpeg to f++ and returns some data
// this method is called by the uploadPic method
picApp.submitFace = function(image) { // changed argument from image
	// start of ajax request to f++ api
	$.ajax({
		url: 'https://apius.faceplusplus.com/v2/detection/detect',
	    // type of request i.e. we want to get data
	    type: 'GET',
	    // the data we are sending
	    data: {
	      // calling the fppkey from the locals object stored in the global variable
	      api_key: picApp.locals.fppkey,
	      // calling the fppsecret from the locals object stored in the global variable
	      api_secret: picApp.locals.fppscrt,
	      // calling the url of the user's jpg ???
	      url: image // changed from image
	      // mode: oneface
	    },
	    // what to do when the jpeg is successfully submitted
	    success: function(data) {
	    	console.log('Your image has been submitted for Face++ analysis')
	    	// console logging the user's face data
	    	console.log(data);
	    	// if the user's face is successfully processed do the following
	    	if (data.face[0] != undefined) {
	    		// log user's face_id
	    		console.log(data.face[0].face_id);
	    		// give global variable userID a value of the user's face_id
	    		userID = data.face[0].face_id;
	    		// calling the compareFaces method
	    		picApp.compareFaces();
	    		// calling the deletePic method
	    		// passing deletePic an info argument with a value of picApp.deleteLink
	    		picApp.deletePic(picApp.deleteLink);
	    	}
	    	// if the user's face is not successfully processed do the following
	    	else {
	    		// log error message
	    		console.log('Error processing user\'s image.');
	    		// hide load div
	    		$('.load').fadeOut().addClass('hide');
	    		// hide snap button
	    		$('#snap').fadeOut().addClass('hide');
	    		// darken resultImg div
	    		$('.resultImg').addClass('darken');
	    		// increase opacity of resultImg img
	    		$('.resultImg > img').addClass('opacity');
	    		// show error div
	    		$('.error').fadeIn().removeClass('hide');
	    		// insert error message
	    		$('.errorMessage').html('OOPS! Looks like we\'re having trouble analyzing your image. Let\'s try this again.<br><br>Remember... look straight into the camera so your whole face is clearly visible.');
	    		// show reset button
	    		$('#reset').fadeIn().removeClass('hide');
	    		// reload page on click
	    		$('#reset').on('click', function() {
	    			location.reload();
	    		});
	    		// calling the deletePic method
	    		// passing deletePic an info argument with a value of picApp.deleteLink
	    		picApp.deletePic(picApp.deleteLink);
	    	};
	    }
	});
};

// defining a method named deletePic
// this method deletes the jpeg from imgur
// this method is called by the submitFace method
picApp.deletePic = function(info) {
	$.ajax({
		url: 'https://api.imgur.com/3/image/' + info,
		method: 'DELETE',
		dataType: 'json',
		headers: {
		  Authorization: 'Client-ID ' + picApp.locals.token,
		  Accept: 'application/json'
		},
		success: function(res) {
			console.log('Your image has been deleted from Imgur');
		}
	});
};

// defining a method named compareFaces
// this method compares the user's image with the proto Pratt image
// this method is called by the submitFace method ???
picApp.compareFaces = function() {
	// start of ajax request to f++ api
	$.ajax({
		url: 'https://apius.faceplusplus.com/v2/recognition/compare',
	    // type of request i.e. we want to get data
	    type: 'GET',
	    // the data we are sending
	    data: {
	      // calling the fppkey from the locals object 
	      api_key: picApp.locals.fppkey,
	      // calling the fppsecret from the locals object
	      api_secret: picApp.locals.fppscrt,
	      // calling the face_id of the users image
	      face_id1: prattID,
	      // calling the face_id of the proto Pratt image
	      face_id2: userID
	    },
	    // what to do when the jpeg is successfully submitted
	    success: function(data) {
	    	console.log('Face++ is calculating your Pratt percentage');
	    	// console logging the result of the face comparison
	    	console.log(data);
	    	// console logging the similarity
	    	console.log(data.similarity);
	    	// defining a variable named percentSim to hold the similarity value
	    	var percentSim = data.similarity
	    	// calling the returnPercent method
	    	// passing returnPercent the percentSim value
	    	picApp.returnPercent(percentSim);
	    },
	    // what to do when there's an error
	    error: function (xhr, ajaxOptions, thrownError) {
	    	// log error messages
	    	console.log('Error comparing submitted images.');
	        console.log(xhr.status);
	        console.log(thrownError);
	        // hide load div
	        $('.load').fadeOut().addClass('hide');
	        // hide snap button
	        $('#snap').fadeOut().addClass('hide');
	        // darken resultImg div
	        $('.resultImg').addClass('darken');
	        // increase opacity of resultImg img
	        $('.resultImg > img').addClass('opacity');
	        // show error div
	        $('.error').fadeIn().removeClass('hide');
	        // insert error message
	        $('.errorMessage').html('OOPS! Looks like we\'re having trouble calculating your Pratt percentage.<br>Let\'s try this again.');
	        // show reset button
	        $('#reset').fadeIn().removeClass('hide');
	        // reload page on click
	        $('#reset').on('click', function() {
	        	location.reload();
	        });
      	}
	});
};

// defining a method named returnPercent
// this method gathers the returned data and displays a result
// this method is called by the submitFace method
picApp.returnPercent = function(percentSim) { //changed argument from info
	// hide load div
	$('.load').fadeOut().addClass('hide');
	// show reset button
	$('#reset').fadeIn().removeClass('hide');
	// reload page on click
	$('#reset').on('click', function() {
		location.reload();
	});
	// defining a variable named percentPratt with a value of percentSim rounded to the nearest integer
	var percentPratt = Math.round(percentSim);
	console.log(percentPratt);
	// if else statements to display different result messages based on percentPratt
	if (percentPratt <= 49) {
		// defining a variable called sentence which holds a string
		var sentence = '<p>Sorry, you\'re only ' + percentPratt + '% Pratt.</p>';
		// this displays the sentence string
		$('.resultText').removeClass('hide').html(sentence);
	} else if (percentPratt >= 50 && percentPratt <= 79) {
		// defining a variable called sentence which holds a string
		var sentence = '<p>Congrats, you\'re ' + percentPratt + '% Pratt!</p>';
		// this displays the sentence string
		$('.resultText').removeClass('hide').html(sentence);
	} else if (percentPratt >= 80) {
		// defining a variable called sentence which holds a string
		var sentence = '<p>' + percentPratt + '% ?! Are you Chris Pratt ??</p>';
		// this displays the sentence string
		$('.resultText').removeClass('hide').html(sentence);
	}
};

// this is the init function
// this makes everything happen!
// the init function calls the canvas method & the takePic method
picApp.init = function() {
	picApp.canvas();
	picApp.takePic();
	console.log('Welcome to % Pratt!');
};

// doc ready and calling init function
$(function() {
		picApp.init();
});

// end of js