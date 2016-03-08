var test = require('tape');

var Surge = require('../index');
var options = require('./options');
var host = options.host;
var debug = options.debug;



test('unsubscribe',function (t){

  t.test('from channel not previously subscribed to',function(st){
    var socket = new Surge({host:host,debug:debug});
    
    socket.on('surge-error',function(data){
      if(data==='There is no such room or this user is not subscribed for this room'){
        socket.disconnect();
        st.pass('should return error');
        st.end();
      }
    });
    socket.unsubscribe('randomChannel');
  });

  t.test('to the same channel twice',function(st){

    var socket = new Surge({host:host,debug:debug});
    
    socket.on('surge-joined-room',function(data){
      socket.unsubscribe('room1');
    });
    socket.on('surge-left-room',function(data){
      socket.unsubscribe('room1');
    })
    socket.on('surge-error',function(data){
      if(data==='Socket not in room'){
        socket.disconnect();
        st.pass('should return error');
        st.end();
      }
    });

    socket.subscribe('room1');

  });

  t.test('one client from channel room1',function(st){
    var socket = new Surge({host:host,debug:debug});

    socket.on('surge-joined-room',function(data){
      socket.unsubscribe('room1');
    });

    socket.on('surge-left-room',function(data){
      t.pass('should receive unsubscribe event');
      t.equal(data.room,'room1','should return unsubscribed room');
      socket.broadcast('room1','fail run',{});

      //waiting if fail case appears
      setTimeout(function(){
        socket.disconnect();
        t.end();
      },500)
    });
    socket.on('fail run',function(){
      t.fail('should not receive event after unsubscribing to room');
    });
    socket.subscribe('room1');
  });

  t.test('two clients from channel room1',function(st){
    var socket = new Surge({host:host,debug:debug});
    var socket2 = new Surge({host:host,debug:debug});
    var tries = 0;
    socket.on('surge-joined-room',function(data){
      subscribed();
    });
    socket2.on('surge-joined-room',function(){
      subscribed();
    });
    socket.on('member-left',function(data){
      t.pass('client should be informed about member leaving the channel');
      completeTest();
    })
    function subscribed(){
      if(tries++ === 1){
        socket2.unsubscribe('room1');
      }
    }

    function completeTest(){
      socket.disconnect();
      socket2.disconnect();
      st.end();
    }
    socket.subscribe('room1');
    socket2.subscribe('room1');
  });
});