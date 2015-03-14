var http = require('http');
var exec = require('child_process').exec;
var fs = require('fs');
var url = require('url');
var sleep = require('sleep');



var POLLING_SERVER = 'localhost';
var POLLING_SERVER_PORT = '1337';
var CAM_ID = 101;
var action = 'status';
var H264 = '.h264';
var MP4 = '.mp4';

/**
 * server listening 
 */
http.createServer(function(req, res){

	if(req.method === 'GET'){
		var path = url.parse(req.url).pathname;
		var ret = "";
		path = path.split('/')[1];

			
			try{
				ret = service[path]();
			}catch(err){
				console.log(err);
				ret = service['status']();
			}
		if(path != 'record_a_video'){

			res.end(ret);	

		}else{
			  var path = ret;
			  var stat = fs.statSync(path);
			  var total = stat.size;
			  if (req.headers['range']) {
			    var range = req.headers.range;
			    var parts = range.replace(/bytes=/, "").split("-");
			    var partialstart = parts[0];
			    var partialend = parts[1];
			 
			    var start = parseInt(partialstart, 10);
			    var end = partialend ? parseInt(partialend, 10) : total-1;
			    var chunksize = (end-start)+1;
			    console.log('RANGE: ' + start + ' - ' + end + ' = ' + chunksize);
			 
			    var file = fs.createReadStream(path, {start: start, end: end});
			    res.writeHead(206, { 'Content-Range': 'bytes ' + start + '-' + end + '/' + total, 'Accept-Ranges': 'bytes', 'Content-Length': chunksize, 'Content-Type': 'video/mp4' });
			    file.pipe(res);
			  } else {
			    console.log('ALL: ' + total);
			    res.writeHead(200, { 'Content-Length': total, 'Content-Type': 'video/mp4' });
			    fs.createReadStream(path).pipe(res);
			  }
		}
	}


}).listen(1438);



function callback(response){
 

	response.on('data', function(chunk){
	 	console.log('action is :'+JSON.parse(chunk).action);
	 	action = JSON.parse(chunk).action;
 	});

 	response.on('end', function () {
	   console.log('end of response');
	   service[action]();
 	});

}

function poll(){
	var options = {
	  host: POLLING_SERVER,
	  path: '/poll',
	  port: POLLING_SERVER_PORT,
	  method: 'GET'
	};

	http.request(options, callback).end();
}

var service = {
	take_a_picture: function(){
		console.log("take_a_picture");
	    var now = new Date(),
      	fileName = '/home/pi/images/' + now.getTime() + '.jpg';

      	var waiting = true;

      	exec('raspistill -t 200 -o ' + fileName+' -q 5', function(err, stdin, stdou){
      		if(err){
      			waiting = false;
      			console.log("error taking picure.");
      		}else{
      			console.log("done.");
      			waiting = false;      		 
      		}
      	});

  		console.log('set time out...');
  		
  		sleep.sleep(3);
		
		return fs.readFileSync(fileName);

	},


	record_a_video: function(){
		console.log("record_a_video");
	    var now = new Date(),
      	fileName = '/home/pi/videos/' + now.getTime();
      	exec('raspivid -o ' + fileName+H264+' -t 1000', function(err, stdin, stdou){
      		if(err){
      			console.log("error taking video.");
      		}
      	});
      	sleep.sleep(3);

//ffmpeg -f lavfi -i aevalsrc=0 -r 30 -i test.h264 -shortest -c:v copy -c:a aac -strict experimental testmp.mp4
		exec('ffmpeg -f lavfi -i aevalsrc=0 -r 30 -i '+fileName+H264+' -shortest -c:v copy -c:a aac -strict experimental '+fileName+MP4,function(err, stdin, stdou){
			if(err){
				console.log('can not convert to mp4.');
			}
		});

  		sleep.sleep(4);
  		
  		return fileName+MP4;
  		
	},

	status: function(){
		return "DEVICE ID : "+CAM_ID;
	},
}



