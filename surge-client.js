'use strict';

var SockJS = require('sockjs-client');

var defs = {
	server  		: 'http://83.212.101.253:808',
	enviroment	: 'production'
}

function Surge(url){

	var events = {};
	var channels = {};
	var socket    = null;
	var rconnect = true;
	var recInterval = null;
	var reconnecting = false;
	var buffer = [];

	var connection = new Connection();

	//TODO: check if url is ip or not
	socket = connect(url);

	_surgeEvents();

	var api = {
		on 					: on,
		subscribe 	: subscribe,
		unsubscribe : unsubscribe,
		disconnect 	: disconnect,
		connect 		: connect,
		emit 				: emit,
		connection  : connection,
		socket  		: socket
	};
	return api;


 
	function on(name,callback){
    if(!events[name]) {
    	events[name] = [];
    }
    // Append event
    events[name].push(callback);
  };

	function subscribe(room){
		emit('surge-subscribe',{room:room});
		var channel = new Channel(room);
		channels[room] = channel;
		return channel;
	};
	function unsubscribe(room){
		emit('surge-unsubscribe',{room:room});
	};
	function disconnect(){
		socket.close();
		buffer = [];
	};

	function connect(url){
		var ip = url || defs.server;

		if(socket) {
        // Get auto-reconnect and re-setup
        connection.state = 'connecting';
        var p = rconnect;
        disconnect();
        rconnect = p;
    }
		connection.state='connecting';
		return new SockJS(ip);
	};

	function emit(channel,name,data){
		var data = {};

		if(arguments.length<2){
			console.error('emit needs at least 2 arguments');
			return;
		}

		data.name = arguments[arguments.length-2];
		data.message = arguments[arguments.length-1];
		data.channel = arguments.length === 3 ? arguments[0] : undefined;

		if(defs.enviroment=='production'){
			console.log('Surge : Event sent : ' + JSON.stringify(data));
		}
		if(socket){
			socket.emit(data);
		}
		else{
			buffer.push(JSON.stringify(data));
		}
	};
	function _catchEvent(response) {
		var name = response.name,
		data = response.data;
		var _events = events[name];
		if(_events) {
			var parsed = (typeof(data) === "object" && data !== null) ? data : data;
			for(var i=0, l=_events.length; i<l; ++i) {
				var fct = _events[i];
				if(typeof(fct) === "function") {
					// Defer call on setTimeout
					(function(f) {
					    setTimeout(function() {f(parsed);}, 0);
					})(fct);
				}
			}
		}
	};
	//Private functions
	function _surgeEvents(){
    on('surge-joined-room',function(room){
	  	if(!connection.inRoom(room)){
	  		connection.rooms.push(room);
	  		channels[room].state = 'connected';

	  		//TODO: introduce private channels
	  		channels[room].type = 'public';
			}
		});
		on('surge-left-room',function(room){
			if(connection.inRoom(room)){
				connection.rooms.splice(connection.rooms.indexOf(room), 1);

				channels[room].state = 'connected';
				channels[room].on = null;
			}
		});
		socket.onopen = function() {
			connection.state = 'connected';
			//In case of reconnection, resubscribe to rooms
			if(reconnecting){
				reconnecting = false;
				reconnect();
			}
		};
		socket.onclose = function() {
			if(rconnect){
				connection.state='attempting reconnection';
				reconnecting = true;
			}
			else{
				connection.state = 'disconnected';
			}
			socket = null;
			recInterval = setInterval(function() {
				socket = connect();
				clearInterval(recInterval);
				_surgeEvents();
			}, 2000);
		};
		socket.onmessage = function (e) {
			if(!e.data){
				console.info('no data received');
				return;
			}
			var data = JSON.parse(e.data);
			if(defs.enviroment=='production'){
				console.log('Surge : Event received : ' + e.data);
			}
			_catchEvent(data);
		};
		socket.emit = function (data){
			if(connection.state==='connected'){
				this.send(JSON.stringify(data));
			}
			else{
				//enter to buffer
				buffer.push(JSON.stringify(data));
			}
			
		}

		function reconnect(){
			//resubscribe to rooms
			for (var i = connection.rooms.length - 1; i >= 0; i--) {
				subscribe(connection.rooms[i]);
			};
			//send all events that were buffered
			if(buffer.length>0){
				for (var i = 0; i < buffer.length; i++) {
					console.log('sending message from buffer : '+buffer[i]);
					socket.send(buffer[i]);
				};
				buffer = [];
			}
		}
	}
	function Channel(room){
		this.room = room;
		this.state = 'initializing';
		this.type = 'initializing';//public,private
		this.unsubscribe = function(){
			emit('surge-unsubscribe',{room:this.room});
		}
	}
};

//	Connection class
//	Keeps details regarding the connection state,rooms,.etc
function Connection(){
	this.rooms  = [];
	this.state 	= 'not initialized';
}

Connection.prototype.inRoom = function(room){
	return this.rooms.indexOf(room)>=0 ? true:false;
}

module.exports = Surge;