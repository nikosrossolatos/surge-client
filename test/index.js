var test = require('tape');

var Surge = require('../index');
var host = 'http://192.168.0.6:8080';


test('Api',function (t){
	var socket = new Surge({host:host});

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

test('defaults',function (t){
	var socket = new Surge({host:host});

	t.ok(socket.connection.host,'should have default host');
	
	socket.disconnect();
	t.end();
});

test('emit',function (t){
	var socket = new Surge({host:host});

	socket.on('emit event',function(){
		t.fail('should not receive his own event on an emit');
	});

	socket.emit('emit event',{data:'data'});
	t.pass('run emit without errors');
	
	setTimeout(function(){
		socket.disconnect();
		t.end();
	},1000);
	
});

test('on',function (t){
	var socket = new Surge({host:host});

	socket.on('test',function(data){
		t.pass('should add custom event handlers');
		t.equal(data.message,'test message','Message should be received correctly in custom handler');
		socket.disconnect();
		t.end();
	});

	//Sending events after registering on handler
	socket.broadcast('test',{message:'test message'})
});

test('subscribe',function (t){
	
	t.test('one client',function (st){
		var socket = new Surge({host:host});

		socket.on('surge-joined-room',function(data){
			st.ok(data.room=='room1','should subscribe to room');
			st.ok(data.subscribers===1,'room should have only have one subscriber when first socket subscribes');

			socket.disconnect();
			st.end();
		});

		socket.subscribe('room1');
	});

	t.test('two clients',function (st){
		var socket = new Surge({host:host});
		var socket2 = new Surge({host:host});

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

test('unsubscribe',function (t){
	var socket = new Surge({host:host});

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

test('broadcast',function (t){
	var socket = new Surge({host:host});
	var socket2 = new Surge({host:host});
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


test('channel',function (t){
	var socket = new Surge({host:host});
	
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