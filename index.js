var Gpio = require('onoff').Gpio;
var LED = new Gpio(17, 'out');

var ws281x = require('./node_modules/rpi-ws281x-native/lib/ws281x-native');
var NUM_LEDS = parseInt(process.argv[2], 10) || 3,
    pixelData = new Uint32Array(NUM_LEDS);
ws281x.init(NUM_LEDS);
process.on('SIGINT', function () {
  ws281x.reset();
  process.nextTick(function () { process.exit(0); });
});


function rgb2Int(r, g, b) {
  return ((r & 0xff) << 16) + ((g & 0xff) << 8) + (b & 0xff);
}

function hex2Int(hex) {
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? rgb2Int(parseInt(result[1],16),parseInt(result[2],16),parseInt(result[3],16)) : null;
}

function set_color(code) {
  for(var i = 0; i < NUM_LEDS; i++) {pixelData[i] = hex2Int(code);}
  ws281x.render(pixelData);
}

//ws281x.render(0x00cc22);

/*
// ---- animation-loop
var offset = 0;
setInterval(function () {
  for (var i = 0; i < NUM_LEDS; i++) {
    pixelData[i] = colorwheel((offset + i) % 256);
  }

  offset = (offset + 1) % 256;
  ws281x.render(pixelData);
}, 1000 / 30);

console.log('Press <ctrl>+C to exit.');

// rainbow-colors, taken from http://goo.gl/Cs3H0v
function colorwheel(pos) {
  pos = 255 - pos;
  if (pos < 85) { return rgb2Int(255 - pos * 3, 0, pos * 3); }
  else if (pos < 170) { pos -= 85; return rgb2Int(0, pos * 3, 255 - pos * 3); }
  else { pos -= 170; return rgb2Int(pos * 3, 255 - pos * 3, 0); }
}
*/

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
  socket.emit('change request', '#500030');
  
  //
  // Detect if someone touched the control dial...
  // if so
  // socket.emit('change request', new_color);
  //

  socket.on('change request', function (data) {
    console.log('[C] '+data.username+': '+data.request+' (validated='+data.validated+')');
    blinkLED();
    set_color(data.request);
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

