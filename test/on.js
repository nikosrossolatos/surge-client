var test = require('tape');

var Surge = require('../index');
var options = require('./options');
var host = options.host;
var debug = options.debug;

test('on',function (t){
  var socket = new Surge({host:host,debug:debug});

  socket.on('test',function(data){
    t.pass('should add custom event handlers');
    t.equal(data.message,'test message','Message should be received correctly in custom handler');
    socket.disconnect();
    t.end();
  });

  socket.on('test');
  t.pass('should not throw when registering events without callbacks');

  //Sending events after registering on handler
  socket.broadcast('test',{message:'test message'})
});