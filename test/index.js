var test = require('tape');

var Surge = require('../index');
var host = 'http://137.135.130.124:8080';

test('Surge', function (t) {
	var client1 = new Surge({host:host});
	var client2;

	// loading 100 sockets
	// for (var i = 0; i < 100; i++) {
	// 	(function(index){
	// 		var client = new Surge({host:host});
	// 		client.on('open',function(){
	// 			console.log('opened connection for socket #'+index);
	// 			client.on('close',function(){
	// 			})
	// 			client.disconnect();
	// 		});
	// 	})(i)
	// };
	var totalClients = 3;
	var clientsKilled = 0;
	var surge = new Surge({host:host});

	surge.on('open',function(){
		t.pass('Surge socket opened');

		surge.on('kill test',function(){
			clientsKilled++;
			if(clientsKilled===totalClients){
				surge.disconnect();
				t.end();
			}
		});
	});

	client1.on('open',function(){
		t.ok(client1.connection.state==='connected','client1 should connect');

		client1.emit('test event',{});
		t.pass('should send emit')
		client1.on('test event',function(){
			t.pass('should receive emit');
		});

		client1.on('surge-joined-room',function(data){
			t.ok(data.room=='room1','should subscribe to room');
			t.ok(data.subscribers===1,'room should have only have one subscriber');
			client2 = initializeClient();
		});

		client1.on('member-joined',function(data){
			t.pass('Should receive notification when client2 subscribes');
			t.ok(data.subscribers===2,'Subscribers in room now should be 2');
			client1.broadcast('room1','test channel',{});
		});

		client1.on('test channel',function(){
			t.pass('client1 should see test-channel broadcast to room');
			client1.emit('kill test',{})
			client1.disconnect();
		});
		client1.subscribe('room1');

		var client3 = new Surge({host:host});

		client3.on('open',function(data){
			var channel = client3.subscribe('room2');

			client3.on('surge-joined-room',function(data){
				t.equal(channel.room,'room2','Channel should have property room correctly set');
				t.equal(channel.state,'connected','Channel should show connected');
				t.ok(typeof channel.unsubscribe == 'function','Channel should have an unsubscribe function');

				client3.on('surge-left-room',function(data){
					t.equal(data,'room2','Should leave the room with channel.unsubscribe');
					//testing channel ended
					client3.emit('kill test',{});
					client3.disconnect();

				});
				
				channel.unsubscribe();
				
			})
		})
		
		function initializeClient(){
			var client = new Surge({host:host});
			client.on('open',function(){
				t.pass('client2 should connect');
				client.on('test channel',function(){
					t.pass('client2 should receive broadcast from client1 in the correct channel');
					client.emit('kill test',{});
					client.disconnect();
				});

				client.on('surge-joined-room',function(data){
					t.pass('client2 should subscribe to room');
				});

				client.subscribe('room1');
			});
			return client;
		}

	});
});