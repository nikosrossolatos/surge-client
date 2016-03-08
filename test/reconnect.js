var test = require('tape');

var Surge = require('../index');
var options = require('./options');
var host = options.host;
var debug = options.debug;

test('reconnect',function(t){
  var socket = new Surge({host:host,debug:debug});
  var tries = 0;
  socket.on('open',function(){
    //first time it opens the reconnect worked
    if(tries===1){
      t.pass('should reconnect');
      //trying connect without disconnecting should throw error
      socket.connect(); 
    }
  });
  socket.on('surge-error',function(data){
    if(data==='Socket already connected'){
      t.pass('trying to connect with open connection should throw error');
      socket.disconnect();
      t.end();
    }
  })
  socket.on('close',function(data){
    if(tries++<1){
      //socket is now disconnected
      socket.emit('test event',{});
      socket.connect();
    }
  })
  socket.disconnect();
});