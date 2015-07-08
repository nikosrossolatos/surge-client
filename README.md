#Surge-client

Surge is a "framework" for SockJS, providing an API on top of SockJS. If you come from socket.io like i did, you will find it easier to adjust with SockJS using Surge.

##How to use

Surge-client connects automatically with a standalone [surge](https://github.com/spideynr/surge) server. Alternatively, you can clone your own surge server and change the ip that surge-client connects to.

```js
<script src="surge-client.min.js"></script>
<script>
  
  var surge = new Surge(); //You can also use new Surge('http://yourownserver.com:port');
  surge.on('event', function() {});
  surge.emit('room','event',{});
  
  var channel = surge.subscribe('room');
  channel.unsubscribe('room');
  
</script>
```

surge-client is built using browserify and includes SockJS library. Minified it is 70kB.

###Node.JS (server-side usage)
Add the surge-client source to your server directory and use it like below.
```js
  var surge = require('./path/to/lib/surge-client.js')();
  surge.on('event', function() {});
  surge.emit('room','event',{});
  
  var channel = surge.subscribe('room');
  channel.unsubscribe('room');

```

There is a plan for the future to create similar libraries for python,php and ruby servers. But if you want to built it yourself, do a pull request and we will happily intergrate it!

##Build
For development purposes you can install [browserify](http://browserify.org/#install) [watchify](https://github.com/substack/watchify) and [uglify](https://github.com/mishoo/UglifyJS2) and use the npm task manager to build the dependancies.

To watch everything for production purposes you can run :
> npm run watch  

You can also build the surge-client library and minify it using
> npm run build

##Roadmap
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
