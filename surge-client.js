'use strict';

var SockJS = require('sockjs-client');

var defs = {
	server  		: 'http://83.212.100.253:8080',
	debug  			: false 
}

function Surge(options){

	var events = {};
	var channels = {};
	var socket    = null;
	var rconnect = true;
	var recInterval = null;
	var reconnecting = false;
	var buffer = [];
	
	var o = options || {};

	var url = o.host || defs.server;
	var debug = o.debug || defs.debug;
	var authEndpoint = o.authEndpoint;

	var connection = new Connection();

	//TODO: check if url is ip or not
	connect();

	var api = {
		on 					: on,
		subscribe 	: subscribe,
		unsubscribe : unsubscribe,
		disconnect 	: disconnect,
		connect 		: connect,
		emit 				: emit,
		connection  : connection,
		channels 		: channels
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
		rconnect = false;
		socket.close();
		buffer = [];
	};

	function connect(){
    socket = _connect();
    _initSocket();
    _surgeEvents();
	}

	function emit(channel,name,message){
		var data = {};

		if(arguments.length<2){
			console.error('emit needs at least 2 arguments');
			return;
		}

		data.name = arguments[arguments.length-2];
		data.message = arguments[arguments.length-1];
		data.channel = arguments.length === 3 ? arguments[0] : undefined;

		if(socket){
			if(debug===true){
				console.log('Surge : Event sent : ' + JSON.stringify(data));
			}
			socket.emit(data);
		}
		else{
			if(debug===true){
				console.log('Surge : Event buffered : ' + JSON.stringify(data));
			}
			buffer.push(JSON.stringify(data));
		}
	};

	function _connect(){
		if(socket) {
        // Get auto-reconnect and re-setup
        connection.state = 'connecting';
        var p = rconnect;
        disconnect();
        rconnect = p;
    }
		connection.state='connecting';
		return new SockJS(url);
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
    on('surge-joined-room',function(data){
    	var room = data.room;
    	var subscribers = data.subscribers;
	  	if(!connection.inRoom(room)){
	  		connection.rooms.push(room);
	  		channels[room].state = 'connected';
	  		channels[room].subscribers = subscribers; 
	  		//TODO: introduce private channels
	  		channels[room].type = 'public';
			}
		});
		on('surge-left-room',function(data){
			if(connection.inRoom(room)){
				connection.rooms.splice(connection.rooms.indexOf(room), 1);
				channels[room].state = 'connected';
				channels[room].on = null;
			}
		});
		on('member-joined',function(data){
			channels[data.room].subscribers = data.subscribers;
		});
		on('member-left',function(data){
			channels[data.room].subscribers = data.subscribers;
		});
		on('open',function(data){
			connection.socket_id = data;
		});
	}
	function _initSocket(){
		socket.onopen = function() {
			connection.state = 'connected';
			//In case of reconnection, resubscribe to rooms
			if(reconnecting){
				reconnecting = false;
				reconnect();
			}
			else{
				flushBuffer();
			}
		};
		socket.onclose = function() {
			socket = null;
			_catchEvent({name:'close',data:{}});
			if(rconnect){
				connection.state='attempting reconnection';
				reconnecting = true;
				recInterval = setInterval(function() {
					connect();
					clearInterval(recInterval);
				}, 2000);
			}
			else{
				connection.state = 'disconnected';
			}
		};
		socket.onmessage = function (e) {
			if(!e.data){
				console.info('no data received');
				return;
			}
			var data = JSON.parse(e.data);
			if(debug===true){
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
			flushBuffer();
		}
	}
	function flushBuffer(){
		if(buffer.length>0){
			for (var i = 0; i < buffer.length; i++) {
				console.log('sending message from buffer : '+buffer[i]);
				socket.send(buffer[i]);
			};
			buffer = [];
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
	this.socket_id;
}

Connection.prototype.inRoom = function(room){
	return this.rooms.indexOf(room)>=0 ? true:false;
}

module.exports = Surge;