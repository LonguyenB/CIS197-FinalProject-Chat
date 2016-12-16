var socket = io.connect();

socket.on('connect', function () {
  socket.emit('newUser', prompt('What is your name?'));
});

socket.on('usedName', function () {
  socket.emit('newUser', prompt('Name already taken, what is your name?'));
});

socket.on('userConnected', function () {
  socket.emit('newUser', prompt('User already connected, what is your name?'));
});

socket.on('needPassword', function () {
  socket.emit('givePassword', prompt('Password'));
});

socket.on('createPassword', function () {
  socket.emit('newPassword', prompt('New password'));
});

socket.on('wrongPassword', function () {
  socket.emit('givePassword', prompt('Wrong password, please enter correct password'));
});
socket.on('updateChat', function (username, msg) {
  $('#chat').append('<b>' + username + ':</b> ' + msg + '<br>');
});

socket.on('updateUsers', function (data) {
  $('#users').empty();
  $.each(data, function (key, value) {
    $('#users').append('<div>' + key + '</div>');
  });
});

socket.on('image', sendImage);
socket.on('video', sendVideo);
socket.on('audio', sendAudio);

function sendImage(from, file) {
  $('#chat').append('<b>' + from + '<img src="' + file + '"/>');
}
function sendVideo(from, file) {
  $('#chat').append('<b>' + from + '<video controls src="' + file + '"/>');
}
function sendAudio(from, file) {
  $('#chat').append('<b>' + from + '<audio controls src="' + file + '"/>');
}

$(function () {
  // send message when clicking send button
  $('#sendData').click(function () {
    var message = $('#data').val();
    $('#data').val('');
    $('#data').focus();
    socket.emit('sendMessage', message); 
  });
   // send message when hitting enter
  $('#data').keypress(function (e) {
    if (e.which == 13) {
      $('#sendData').focus().click();
      $('#data').focus();
    }
  });

  $('#uploadImage').bind('change', function (e) {
    var data = e.originalEvent.target.files[0];
    var reader = new FileReader();
    reader.onload = function (event) {
      socket.emit('image', event.target.result);
    };
    reader.readAsDataURL(data);
  });

  $('#uploadVideo').bind('change', function (e) {
    var data = e.originalEvent.target.files[0];
    var reader = new FileReader();
    reader.onload = function (event) {
      socket.emit('video', event.target.result);
    };
    reader.readAsDataURL(data);
  });

  $('#uploadAudio').bind('change', function (e) {
    var data = e.originalEvent.target.files[0];
    var reader = new FileReader();
    reader.onload = function (event) {
      socket.emit('audio', event.target.result);
    };
    reader.readAsDataURL(data);
  });
});

window.reset = function (e) {
  e.wrap('<form>').closest('form').get(0).reset();
  e.unwrap();
};