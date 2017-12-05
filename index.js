var Gpio = require('onoff').Gpio;
var LED = new Gpio(17, 'out');

function blinkLED() {
    LED.writeSync(1);
    setTimeout(()=>{LED.writeSync(0)}, 320);
}

const io = require('socket.io-client');
var socket = io('http://xmaslight.herokuapp.com/');
//var socket = io('http://localhost:3000/');
var config = require('./config.json');
var username = config.Name||'bot';

socket.on('connect', function () {
  
  socket.emit('add user', username);
  socket.emit('new message', 'hello world');
  socket.emit('change request', '#ff0000');
  
  //
  // Detect if someone touched the control dial...
  // if so
  // socket.emit('change request', new_color);
  //

  socket.on('change request', function (data) {
    console.log('[C] '+data.username+': '+data.request+' (validated='+data.validated+')');
    blinkLED();
    //
    // Someone requested to change the color.
    // Do IO-magic here...
    //
  });

  socket.on('new message', function (data) {
    console.log('[M] '+data.username+': '+data.message);
    blinkLED();
  });

  socket.on('user joined', function (data) {
    console.log(data.username + ' joined');
    blinkLED();
  });

  socket.on('user left', function (data) {
    console.log(data.username + ' left');
    blinkLED();
  });

  socket.on('disconnect', function () {
    console.log('you have been disconnected');
    socket.emit('new message', 'I disconnected...');
  });

  socket.on('reconnect', function () {
    console.log('you have been reconnected');
    if (username) {
      socket.emit('add user', username);
    }
    socket.emit('new message', 'I reconnected...');
  });

  socket.on('reconnect_error', function () {
    console.log('attempt to reconnect has failed');
    socket.emit('new message', 'Error when reconnecting...');
  });

});

