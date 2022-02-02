const version='1.2 02/2022';
var config = require('./config.json');
var ws281x = require('rpi-ws281x');
var NUM_LEDS = parseInt(config.NUM_LEDS) || 18,
    pixelData = new Uint32Array(NUM_LEDS);
ws281x.configure({leds:NUM_LEDS});
process.on('SIGINT', function () {
  //ws281x.reset();
  process.nextTick(function () { process.exit(0); });
});
var current_color='008000';
set_color(current_color,NUM_LEDS);
//push_color_array(['303030',,'808080',,'303030'],50);

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

function blinkLED() {
    push_color_array(['303030',,'808080',,'303030'],50);
}


const io = require('socket.io-client');
var socket = io('https://xmaslight.herokuapp.com/');
var username = config.Name||'bot';

socket.on('connect', function () {
  //console.log('[INIT] '+username+': '+(config.WelcomeMessage||'hello world')+' ('+require('os').networkInterfaces()['wlan0'][0]['address']+' @v'+version+')');
  socket.emit('add user', username);
  //console.log('===ADD USER=== '+username);
  socket.emit('new message', (config.WelcomeMessage||'hello world')+' ('+require('os').networkInterfaces()['wlan0'][0]['address']+' @v'+version+')');
  socket.emit('change request', config.Color||'#500030');
});

  socket.on('change request', function (data) {
    //console.log('[C] '+data.username+': '+data.request);
    current_color=data.request;
    blinkLED();
  });

  socket.on('new message', function (data) {
    console.log('[M] '+data.username+': '+data.message);
    blinkLED();
  });

  socket.on('status', function (data) {
    //console.log('[S] '+data.message);
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

  socket.on('disconnect', function (reason) {
    //socket.close();
    //console.log('you have been disconnected '+reason);
    current_color='101010';
    set_color(current_color,NUM_LEDS);
    push_color_array(['300000'],15000);
  });

  socket.on('reconnect', function () {
    //console.log('you have been reconnected');
    if (username) {
      socket.emit('add user', username);
      //console.log('===RE-ADD USER=== '+username);
    }
    socket.emit('change request', config.Color||'#500030');
  });

  socket.on('reconnect_error', function () {
    console.log('attempt to reconnect has failed');
  });


/*
	THERMAL-PRINTER ADD-ON
const printer="/dev/ttyS0";
const baudrate="9600";
p=require('child_process');
p.execSync('stty -F '+printer+' '+baudrate);

let IP=require('os').networkInterfaces()['wlan0'][0]['address'];
let welcome="================================\\n"+IP+" CONNECTING TO\\nhttps://xmaslight.herokuapp.com\\n"+"================================";
print_thermal(welcome);

function print_thermal(text) {
  p.execSync('echo "'+text+'" > '+printer,'e');
}
*/ 

Date.prototype.addHours= function(h){this.setHours(this.getHours()+h); return this;}
//winter: addHours(1), summer: addHours(2)
function get_time(long) {var date=new Date().addHours(1);var hour=date.getHours();hour=(hour<10?"0":"")+hour;var min=date.getMinutes();min=(min<10?"0":"")+min;return hour+((long)?":":"")+min;}

function message(msg) {
  var mapUmlaute = {ä:"ae",ü:"ue",ö:"oe",Ä:"Ae",Ü:"Ue",Ö:"Oe",ß:"ss"};
  msg=msg.replace(/[äüöÄÜÖß]/g,function(m){return mapUmlaute[m]});
  msg=msg.replace(/\ {2,}/g," ");
  msg=get_time()+" "+msg;
  //print_thermal(msg);
}


var util = require('util');
console.log = function(d) {
  message(d);
  process.stdout.write(util.format(d) + '\n');
};

