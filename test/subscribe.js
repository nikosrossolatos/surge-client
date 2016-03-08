var test = require('tape');

var Surge = require('../index');
var options = require('./options');
var host = options.host;
var debug = options.debug;


test('subscribe',function (t){

  t.test('to the same channel twice',function(st){

    var socket = new Surge({host:host,debug:debug});

    socket.on('surge-joined-room',function(data){
        socket.subscribe('room1');
    });

    socket.on('surge-error',function(data){
      if(data==='Socket already subscribed to room'){
        st.pass('should return error');
        socket.disconnect();
        st.end();
      }
    })
    socket.subscribe('room1');

  });
  
  t.test('channels after reconnecting',function(st){
    var socket = new Surge({host:host,debug:debug});
    var tries = 0;

    socket.on('surge-joined-room',function(data){
      if(tries++<1){
        socket.disconnect(true);
      }
      //Surge server will respond a second time with joined room since on disconnect the user will also unsubscribe from all channels
      else{
        t.pass('should re-subscribe to all channels after reconnecting');
        socket.disconnect();
        st.end();
      }
      tries++;
    });
    socket.subscribe('room1');

  });

  t.test('one client',function (st){
    var socket = new Surge({host:host,debug:debug});

    socket.on('surge-joined-room',function(data){
      st.ok(data.room=='room1','should subscribe to room');
      st.ok(data.subscribers===1,'room should have only have one subscriber when first socket subscribes');

      socket.disconnect();
      st.end();
    });

    socket.subscribe('room1');
  });

  t.test('two clients',function (st){
    var socket = new Surge({host:host,debug:debug});
    var socket2 = new Surge({host:host,debug:debug});

    var runs = 0;

    socket.on('surge-joined-room',function(data){
      checkCase(data);
    });

    socket2.on('surge-joined-room',function(data){
      checkCase(data);
    });

    function checkCase(data){
      if(runs===0){
        runs++;
      }
      else{
        st.ok(data.subscribers===2,'room should have 2 subscribers when both connect');
        completeTest();
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

  t.end();
});