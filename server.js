var express = require('express');
var app = express();
var http = require('http');
var server = http.createServer(app); 
var io = require('socket.io').listen(server);

server.listen(3000);

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});

// global for usernames and passwords and currently connected users
var userPass = {};
var usernames = {};

io.sockets.on('connection', function (socket) {

  socket.on('sendMessage', function (data) {
    io.sockets.emit('updateChat', socket.username, data);
  });

  socket.on('image', function (data) {
    io.sockets.emit('image', socket.username, data);
  });

  socket.on('video', function (data) {
    io.sockets.emit('video', socket.username, data);
  });

  socket.on('audio', function (data) {
    io.sockets.emit('audio', socket.username, data);
  });

  //when a new user is connecting, needs to check if there's already a user
  // of the same name, if there is need a password and also check
  // if user is already connected, if not can't connect
  socket.on('newUser', function (username) {
    var used = false;
    var connected = false;

    if (userPass.hasOwnProperty(username)) {
      used = true;
    }
    var currentUsers = Object.keys(usernames);
    var pos = currentUsers.indexOf(username);

    if (pos >= 0) {
      connected = true;
    }

    socket.username = username;
    if (!connected) {
      if (!used) {
        usernames[username] = username;
        userPass[username] = '';
        socket.emit('createPassword');
      } else {
        socket.emit('needPassword');
      }
    } else {
      socket.emit('userConnected');
    }
  });

  // creates a new user - adds to object and sets the password
  // and puts the person in the current users
  socket.on('newPassword', function (password) {
    if (userPass.hasOwnProperty(socket.username)) {
      userPass[socket.username] = password;
    }

    socket.emit('updateChat', 'SERVER', 'you have connected');
    socket.broadcast.emit('updateChat', 'SERVER', socket.username + ' has connected');
    io.sockets.emit('updateUsers', usernames);
  });

  // get a password and check if the password is correct for the user
  socket.on('givePassword', function (password) {
    if (userPass.hasOwnProperty(socket.username)) {
      if (userPass[socket.username] === password) {
        usernames[socket.username] = socket.username;
        socket.emit('updateChat', 'SERVER', 'you have connected');
        socket.broadcast.emit('updateChat', 'SERVER', socket.username + ' has connected');
        io.sockets.emit('updateUsers', usernames);
      } else {
        socket.emit('wrongPassword');
      }
    }
  });

  socket.on('disconnect', function () {
    delete usernames[socket.username];
    io.sockets.emit('updateUsers', usernames);
    socket.broadcast.emit('updateChat', 'SERVER', socket.username + ' has disconnected');
  });
});