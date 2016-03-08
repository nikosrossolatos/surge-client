var test = require('tape');

var Surge = require('../index');
var options = require('./options');
var host = options.host;
var debug = options.debug;



test('channel',function (t){
  // Always run one with a debug true for debug testing
  var socket = new Surge({host:host,debug:true});
  
  var channel = socket.subscribe('room1');
  t.ok(channel instanceof Object,'should be object');
  t.ok(channel.unsubscribe instanceof Function,'should have unsubscribe function');
  t.ok(channel.emit instanceof Function,'should have emit function');
  t.ok(channel.broadcast instanceof Function,'should have broadcast function');
  t.equal(channel.room,'room1','should have correct room initialized');

  socket.on('surge-joined-room',function(){
    t.equal(channel.state,'connected','state should be connected after connection');
    t.equal(channel.subscribers,1,'should show correct subscribers');
    channel.broadcast('test event',{});
    //TODO: verify this works.
    channel.emit('test event2',{});
  });

  socket.on('test event',function(){
    t.pass('should be able to broadcast to room');
    channel.unsubscribe();
  });

  socket.on('surge-left-room',function(){
    t.pass('should be able to unsubscribe');
    t.equal(channel.state,'disconnected','should be disconnected after unsubscribing');
    socket.disconnect();
    t.end();
  });
});