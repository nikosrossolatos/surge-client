var test = require('tape');

var Surge = require('../index');

test('Api',function (t){

  //Optionless branch
  var socket = new Surge();

  t.ok(socket.on instanceof Function,'should have on handler');
  t.ok(socket.subscribe instanceof Function,'should have subscribe function');
  t.ok(socket.unsubscribe instanceof Function,'should have unsubscribe function');
  t.ok(socket.disconnect instanceof Function,'should have disconnect function');
  t.ok(socket.connect instanceof Function,'should have connect function');
  t.ok(socket.emit instanceof Function,'should have emit function');
  t.ok(socket.broadcast instanceof Function,'should have broadcast function');
  t.ok(socket.connection instanceof Object,'should have connection object');
  t.ok(socket.channels instanceof Object,'should have channels object');
  socket.disconnect();
  t.end();
});