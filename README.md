#Surge-client

Surge is a lightweight "framework" for SockJS, providing a Socket.io-like API on top of it, adding extra features out of the box.

##Inspiration

I wanted to build a reliable WebSocket server that i could deploy very fast and have everything i needed in matter of minutes. Having a standalone surge server, i can require the library include my socket-server ip and im good to go. Using the excellent [pusher](https://pusher.com/) library was also a reason.

##How to use

__You dont have to setup your own surge-server__
Surge-client connects automatically with a standalone [surge](https://github.com/spideynr/surge) server that i have already deployed. Alternatively, you can clone your own [surge-server](https://github.com/spideynr/surge) and change the ip that surge-client connects to.

```js
<script src="surge-client.min.js"></script>
<script>
  
  var surge = new Surge(); //You can also use new Surge({host:'http://yourownserver.com:port'});
  
  var channel = surge.subscribe('room');
  
  surge.on('event', function() {});
  surge.emit('room','event',{});
  
  channel.unsubscribe();
  //or
  surge.unsubscribe('room');
  
</script>
```

Just copy paste the above code and it will work out of the box.

Surge-client is built using browserify and includes SockJS library. Minified it is 70kB (including SockJS).

> You should not use the default surge-server for production purposes.

###Node.JS (server-side usage)

Install the library

```shell
npm install --save surgejs-client
```

Example code

```js
  var Surge = require('surgejs-client');
  var surge = new Surge();
  surge.on('event', function() {});
  surge.emit('room','event',{});
  
  var channel = surge.subscribe('room');
  surge.unsubscribe('room');

```

There is a plan for the future to create similar libraries for Python,PHP and Ruby servers. But if you want to built it yourself, do fork it and i will happily intergrate it and reference it here!

##Options 
Option             | Description
-------------------|--------------------------------------------------------------------------------------------------
`host`             | Sets a new surge-server host
`debug`            | When set to `true`, you will see more details about what is happening on your console. Default is `false`
`authEndpoint`     | (Not enabled yet) Url that server will call for authorization

##API

When you call *new Surge()* you will get back a tiny API to interact with the socket. Calling multiple new Surge() objects will not likely work since SockJS has a limitation as to how many WebSockets it can use.

### `.on('event',callback)`
Creates an event handler for this event. Callback returns data received from the socket.

### `.emit('channel','event',data={})`
Channel is optional. Emits an event with data for all sockets connected to the channel (excluding self) or global (if not channel is given).
### `.broadcast('channel','event',data={})`
Channel is optional. Emits an event with data for all sockets connected to the channel (including self) or global (if not channel is given).
### `.subscribe('room')`
Subscribes to a particular room. Also returns a new Channel object where you can also put .on event handlers ( still in production ).

### `.unsubscribe('room')`
Unsubscribe from room.

### `.disconnect()`
Disconnect socket .
### `.connect()`
Connect socket with server. If there is already an open connection it will close it and connect again.

### `.connection`
Connection is an object containing: 
#####`connection.state` 
Returns the socket connection state. (connecting,disconnected,connected, attempting reconnection).
##### `connection.rooms` 
Returns all rooms the socket currently exists in.
##### `connection.inRoom(room)` 
Returns true if the socket exists in the room.

## Events 
Event Name            | Description
----------------------|-----------------------------------------------------------------------------------------------
`open`                | Gets called when the socket is connected. (Will include socket.id soon)
`close`               | Gets called when the socket is closed.
`surge-joined-room`   | Calls when you succesfully enter a room, returns the `room` as string.
`surge-left-room`     | Calls when you succesfully leave a room, returns the `room` as string.

##Features

- Its blazing fast to set something up for development purposes
- Auto-reconnecting already enabled (also reconnects to previously connected rooms) 
- Smaller learning curve if you come from socket.io and you want to use some of its features heads on with the SockJS API
- Event buffering. If the socket gets disconnected all further emits will go to a buffer. Upon reconnection the events will fire with the same series that they were called 
- I will be maintaining this library since i will be using it on production
- Open source! Want to change something? Fork it change it , do a pull request or don't and keep it for yourself
- Check roadmap for more!


##Build
For development purposes you can install [browserify](http://browserify.org/#install), [watchify](https://github.com/substack/watchify) and [uglify](https://github.com/mishoo/UglifyJS2) and use the npm task manager to build the dependancies.

To build-watch everything for production purposes you can run :

```shell
npm run watch  
```

You can also build the surge-client library and minify it using

```shell
npm run build  
```

##Roadmap
- Writting tests 
- Authenticating connection requests using a token/secret hmac
- Add authentication endpoint option for Authenticating users on the socket
- Introduce Private - Preservance Channels after authenticating users
- Build an interface for main Surge server to register developers/apps generate keys and show usage stats for every app
- Add support for persisting users using cookie-based session
- Use redis to scale surge servers behind a HAProxy load balancer and provide a more production-ready library


##Contributions
I will be maintaining this project since i will be using it in production for my apps, but if you want to help out filling the [issue tracker](https://github.com/spideynr/surge-client/issues) or helping with the code, feel free to contact me or do a pull request

##Licence
MIT
