# rasberry-surveillance-node-project

###Use camera to take picture and videos 

Rasberry pi camera will create  h264 videos which you can convert to mp4 using ffmpeg

to install ffmpeg follow this link http://owenashurst.com/?p=242

Node server will provide service end point to take picture and record video
```js
http://host:1438/take_a_picture
http://host:1438/record_a_video
http://host:1438/status
```
use forver https://github.com/foreverjs/forever to run the application continiously 

TODO
### Service to send emails alerts when unwanted activity is detected throught the motion sensor
### Upload pictures and videos on remote amazon s3 
### Provide interface to view past activity



