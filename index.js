const version='1.0';
var config = require('./config.json');
var ws281x = require('./node_modules/rpi-ws281x-native/lib/ws281x-native');
var NUM_LEDS = parseInt(config.NUM_LEDS) || 18,
    pixelData = new Uint32Array(NUM_LEDS);
ws281x.init(NUM_LEDS);
process.on('SIGINT', function () {
  ws281x.reset();
  process.nextTick(function () { process.exit(0); });
});
var current_color='000001';
set_color(current_color,NUM_LEDS);

function rgb2Int(r, g, b) {
  return ((r & 0xff) << 16) + ((g & 0xff) << 8) + (b & 0xff);
}

function hex2Int(hex) {
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? rgb2Int(parseInt(result[1],16),parseInt(result[2],16),parseInt(result[3],16)) : null;
}

function set_color(colorcode,length) {
  for(var i = 1; i <= NUM_LEDS; i++) {
    pixelData[NUM_LEDS-i] = pixelData[NUM_LEDS-i-length] || hex2Int(colorcode);
  }
  ws281x.render(pixelData);
}

var animation;
function push_color_array(color_array,delay) {
  clearInterval(animation);
  var counter=0;
  animation = setInterval(function(){
    if (counter<color_array.length+NUM_LEDS) {
      set_color(color_array[counter]||current_color,1);
    } else {
      clearInterval(animation);
    }
    counter++;
  },delay);
}

var Gpio = require('onoff').Gpio;
var LED = new Gpio(17, 'out');

function blinkLED() {
    push_color_array(['303030',,'808080',,'303030'],50);
    LED.writeSync(1);
    setTimeout(()=>{LED.writeSync(0)}, 320);
}

  //
  // Detect if someone touched the control dial...
  // if so
  // socket.emit('change request', new_color);
  //

const rotaryEncoder = require('./rotary.js');
const myEncoder = rotaryEncoder(5, 6); // Using BCM 5 & BCM 6 on the PI
var summe=100;
var ca = ['ee1515','ee6715','eed615','8cee15','15eea2','15e4ee','157eee','4f15ee','aa15ee','e715ee','ee15a4','ee1543'];
var tout;
myEncoder.on('rotation', direction => {
  clearTimeout(tout);
  if (direction > 0) {
    set_color(ca[(++summe)%ca.length],NUM_LEDS);
    //console.log('Encoder rotated right '+direction+' '+(summe));
  } else {
    set_color(ca[(--summe)%ca.length],NUM_LEDS);
    //console.log('Encoder rotated left '+direction+' '+(summe));
  }
  tout = setTimeout(function () {socket.emit('new message', '#'+ca[(summe)%ca.length])},3000)
});

var pushButton = new Gpio(16, 'in', 'both');
pushButton.watch(function (err, value) {
  if (err) {
    console.error('There was an error', err);
  return;
  }
  console.log(value);
  //socket.emit('new message', '#'+ca[(summe)%ca.length]);
});

/*
function unexportOnClose() { //function to run when exiting program
  pushButton.unexport(); // Unexport Button GPIO to free resources
};

process.on('SIGINT', unexportOnClose); //function to run when user closes using ctrl+c
*/

  //
  // Detect if someone touched the control dial...
  // if so
  // socket.emit('change request', new_color);
  //


const io = require('socket.io-client');
var socket = io(config.SocketURL||'https://xmaslight.herokuapp.com/');
//var socket = io('http://localhost:3000/');
var username = config.Name||'bot';

socket.on('connect', function () {
  
  socket.emit('add user', username);
  socket.emit('new message', (config.WelcomeMessage||'hello world')+' ('+require('os').networkInterfaces()['wlan0'][0]['address']+' @v'+version+')');
  socket.emit('change request', config.Color||'#500030');
  
  socket.on('change request', function (data) {
    console.log('[C] '+data.username+': '+data.request);
    current_color=data.request;
    blinkLED();
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
    current_color='101010';
    set_color(current_color,NUM_LEDS);
    push_color_array(['300000'],15000);
  });

  socket.on('reconnect', function () {
    console.log('you have been reconnected');
    if (username) {
      socket.emit('add user', username);
    }
    socket.emit('change request', config.Color||'#500030');
  });

  socket.on('reconnect_error', function () {
    console.log('attempt to reconnect has failed');
  });

});

