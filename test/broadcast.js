var test = require('tape');

var Surge = require('../index');
var options = require('./options');
var host = options.host;
var debug = options.debug;


test('broadcast',function (t){
  var socket = new Surge({host:host,debug:debug});
  var socket2 = new Surge({host:host,debug:debug});
  var subscribeRuns = 0;
  var emitRuns = 0;

  socket.on('surge-joined-room',function(data){
    waitSubscribe();
  });

  socket2.on('surge-joined-room',function(data){
    waitSubscribe();
  });

  socket.on('test event',function(data){
    waitEmit();
  });
  socket2.on('test event',function(data){
    waitEmit();
  })
  socket.subscribe('room1');
  socket2.subscribe('room2');

  function waitSubscribe(){
    subscribeRuns? socket.broadcast('test event',{}): subscribeRuns++;
  }

  function waitEmit(){
    if(emitRuns){
      t.pass('second socket received emit');
      completeTest();
    }
    else{
      emitRuns++;
      t.pass('first socket received emit');
    }
  }

  function completeTest(){
    t.pass('both sockets should receive message on channel');
    socket.disconnect();
    socket2.disconnect();
    t.end();
  }
});
