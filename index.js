const io = require('socket.io-client');
var socket = io('http://xmaslight.herokuapp.com/');
var username = 'bot';

socket.on('connect', function () {
  
  socket.emit('add user', username);
  socket.emit('new message', 'hello world');
  socket.emit('change request', '#ff0000');
  
  socket.on('change request', function (data) {
    console.log('[C] '+data.username+': '+data.color);
    //
    // io-magic with rbg-strip here...
    //
  });

  socket.on('new message', function (data) {
    console.log('[M] '+data.username+': '+data.message);
  });

  socket.on('user joined', function (data) {
    console.log(data.username + ' joined');
  });

  socket.on('user left', function (data) {
    console.log(data.username + ' left');
  });

  socket.on('disconnect', function () {
    console.log('you have been disconnected');
  });

  socket.on('reconnect', function () {
    console.log('you have been reconnected');
    if (username) {
      socket.emit('add user', username);
    }
  });

  socket.on('reconnect_error', function () {
    console.log('attempt to reconnect has failed');
  });

});

