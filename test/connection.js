var test = require('tape');

var Surge = require('../index');
var options = require('./options');
var host = options.host;
var debug = options.debug;

test('Connection',function(t){
  var socket = new Surge({host:host,debug:debug});
  socket.subscribe('room1');
  socket.on('surge-joined-room',function(){
    socket.connection.rooms = [];
    socket.unsubscribe('room1');
  });
  socket.on('surge-left-room',function(){
    t.ok(socket.connection.rooms.indexOf('room1')<0,'room shouldn\' exist after messing with the object');
    socket.disconnect();
    t.end();
  })
});
