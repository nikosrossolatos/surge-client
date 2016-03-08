var test = require('tape');

var Surge = require('../index');
var options = require('./options');
var host = options.host;
var debug = options.debug;

test('defaults',function (t){
  var socket = new Surge({host:host,debug:debug});

  t.ok(socket.connection.host,'should have default host');
  socket.on('open',function(){
    t.pass('should connect');
    t.ok(socket.connection.state==='connected','should update state');
    socket.disconnect();
    t.end();
  })
});