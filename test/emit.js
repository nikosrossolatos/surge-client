var test = require('tape');

var Surge = require('../index');
var options = require('./options');
var host = options.host;
var debug = options.debug;

test('emit',function (t){
  var socket = new Surge({host:host,debug:debug});

  socket.on('emit event',function(){
    t.fail('should not receive his own event on an emit');
  });

  socket.emit('emit event',{data:'data'});
  t.notOk(socket.emit(),'should fail without arguments');
  t.notOk(socket.emit('emit event'),'should fail with one argument');
  t.pass('run emit without errors');
  
  setTimeout(function(){
    socket.disconnect();
    t.end();
  },1000);
  
});