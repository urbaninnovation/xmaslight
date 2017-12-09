const version='0.1';
// Setup basic express server
var express = require('express');
var app = express();
var path = require('path');
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var port = process.env.PORT || 3000;

server.listen(port, function () {
  console.log('Server listening at port %d', port);
});

// Routing
app.use(express.static(path.join(__dirname, 'public')));

// Chatroom

var numUsers = 0;
var socketList = [];
Array.prototype.remove = function(e) {var t, _ref; if ((t = this.indexOf(e)) > -1) {return ([].splice.apply(this, [t,1].concat(_ref = [])), _ref)}};

io.on('connection', function (socket) {
  var addedUser = false;

  // socket.emit = reply only to the client who asked
  // socket.broadcast.emit = reply to all clients except the one who asked
  // io.socket.emit = reply to all clients (including the one who asked)

  socket.emit('status',{message:'----------------------------------------'});
  socket.emit('status',{message:' WELCOME to XMASLIGHT console v'+version});
  socket.emit('status',{message:' Set your name with: nick [yourname]'});
  socket.emit('status',{message:' See a list of all users with: users'});
  socket.emit('status',{message:' Change XMASLIGHT color with #[code]'});
  socket.emit('status',{message:'----------------------------------------'});

  // when the client emits 'new message', this listens and executes
  socket.on('new message', function (data) {
    // we tell the client to execute 'new message'
    socket.broadcast.emit('new message', {
      username: socket.username,
      message: data
    });

    // nick
    var nick=(/nick\ ([0-9a-z_]{3,24})$/i.exec(data));
    if (nick) 
    {
      username=nick[1];
      socket.emit('renamed', {
        username: username,
        message: 'You successfully changed your nick to '+username+'.'
      });
      io.sockets.emit('status', {
        username: 'SYSTEM',
        message: socket.username+' is now known as '+username+'.'
      });
      socket.username=username;
    }
    // users
    if (/^users$/i.test(data)) 
    {
      io.sockets.emit('status', {
        username: 'SYSTEM',
        message: numUsers+' Teilnehmer: '+socketList.reduce((a,v)=>{a.push(v.username); return a},[]).join(', ')
      });
    }
    // change color
    if (/^\#[0-9a-f]{3,6}$/i.test(data)) //[0-9,a-f,A-F]{,6}$
    {
      io.sockets.emit('change request', {
        username: socket.username,
        request: data,
        validated: true // TODO: validate change request
      });
    }

  });

  // when the client emits 'change request', this listens and executes
  socket.on('change request', function (color) {
    io.sockets.emit('change request', {
      username: socket.username,
      request: color,
      validated: true // TODO: validate change request
    });
  });

  // when the client emits 'add user', this listens and executes
  socket.on('add user', function (username) {
    if (addedUser) return;

    // we store the username in the socket session for this client
    socket.username = username;
    ++numUsers;
    addedUser = true;
    socketList.push(socket);
    socket.emit('login', {
      numUsers: numUsers
    });
    // echo globally (all clients) that a person has connected
    socket.broadcast.emit('user joined', {
      username: socket.username,
      numUsers: numUsers
    });
  });

  // when the user disconnects.. perform this
  socket.on('disconnect', function () {
    if (addedUser) {
      --numUsers;
      socketList.remove(socket);

      // echo globally that this client has left
      socket.broadcast.emit('user left', {
        username: socket.username,
        numUsers: numUsers
      });
    }
  });
});
