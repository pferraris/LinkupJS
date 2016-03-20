/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var ClientConnection = __webpack_require__(1);
	var WebSocketClientChannel = __webpack_require__(5);
	var ClientModule = __webpack_require__(3);

	var LinkupJS = {
	  createClient: ClientConnection.create,
	  createChannel: WebSocketClientChannel.create,
	  createModule: ClientModule.create
	};

	module.exports = LinkupJS;

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var SessionModule = __webpack_require__(2);
	var Disconnected = __webpack_require__(4);

	var create = function create() {
	  var channel = null;
	  var isConnected = false;
	  var sessionContext = null;
	  var disconnectionReason = null;
	  var sessionModule = SessionModule.create();
	  var modules = [];

	  var connected = function connected() {};
	  var disconnected = function disconnected(_disconnected) {};
	  var packetReceived = function packetReceived(packet) {};
	  var signedIn = function signedIn() {};
	  var signedOut = function signedOut() {};
	  var authenticationFailed = function authenticationFailed() {};

	  var onConnected = function onConnected() {
	    isConnected = true;
	    connected();
	  };

	  var onDisconnected = function onDisconnected(disconnectionReason) {
	    channel.packetReceived = function (packet) {};
	    channel.closed = function () {};
	    channel = null;
	    isConnected = false;
	    disconnected(disconnectionReason);
	  };

	  var onSignedIn = function onSignedIn(sessionContext) {
	    sessionContext = sessionContext;
	    signedIn();
	  };

	  var onSignedOut = function onSignedOut(sessionContext, current) {
	    if (current) sessionContext = null;
	    signedOut();
	  };

	  var onAuthenticationFailed = function onAuthenticationFailed() {
	    authenticationFailed();
	  };

	  var onPacketReceived = function onPacketReceived(packet) {
	    packetReceived(packet);
	  };

	  var connect = function connect(ch) {
	    channel = ch;
	    var client = this;
	    var auth = {
	      onConnected: onConnected,
	      onDisconnected: onDisconnected,
	      onSignedIn: onSignedIn,
	      onSignedOut: onSignedOut,
	      onAuthenticationFailed: onAuthenticationFailed
	    };

	    channel.onPacketReceived(function (packet) {
	      if (sessionModule.process(packet, auth)) {
	        return;
	      }

	      for (var i = 0; i < modules.length; i++) {
	        if (modules[i].process(packet, client)) {
	          return;
	        }
	      }

	      onPacketReceived(packet);
	    });

	    channel.onClosed(function () {
	      if (!disconnectionReason) {
	        disconnectionReason = Disconnected.reasons.connectionLost;
	      }
	      onDisconnected(disconnectionReason);
	    });
	  };

	  var disconnect = function disconnect(reason, sendReason) {
	    if (!sendReason) sendReason = true;
	    if (reason) {
	      disconnectionReason = reason;
	    } else {
	      disconnectionReason = Disconnected.reasons.clientRequest;
	    }
	    if (channel) {
	      if (sendReason) send(disconnectionReason);
	      channel.close();
	    }
	  };

	  var send = function send(packet) {
	    if (channel) {
	      if (sessionContext != null) {
	        packet.Sender = sessionContext.Id;
	      }
	      channel.send(packet);
	    }
	  };

	  return {
	    isConnected: isConnected,
	    sessionContext: sessionContext,
	    connect: connect,
	    disconnect: disconnect,
	    send: send,
	    addModule: function addModule(module) {
	      modules.push(module);
	    },
	    onConnected: function onConnected(handler) {
	      connected = handler;
	    },
	    onDisconnected: function onDisconnected(handler) {
	      disconnected = handler;
	    },
	    onPacketReceived: function onPacketReceived(handler) {
	      packetReceived = handler;
	    },
	    onSignedIn: function onSignedIn(handler) {
	      signedIn = handler;
	    },
	    onSignedOut: function onSignedOut(handler) {
	      signedOut = handler;
	    },
	    onAuthenticationFailed: function onAuthenticationFailed(handler) {
	      authenticationFailed = handler;
	    }
	  };
	};

	module.exports = {
	  create: create
	};

/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var ClientModule = __webpack_require__(3);

	var create = function create() {
	  var sessionModule = ClientModule.create([{
	    typeName: 'LinkupSharp.Connected',
	    method: function method(packet, client) {
	      client.onConnected();
	      return true;
	    }
	  }, {
	    typeName: 'LinkupSharp.Disconnected',
	    method: function method(packet, client) {
	      client.disconnect(packet.Content.Reason, false);
	      return true;
	    }
	  }, {
	    typeName: 'LinkupSharp.Security.Authentication.SignedIn',
	    method: function method(packet, client) {
	      client.onSignedIn(packet.Content.Session);
	      return true;
	    }
	  }, {
	    typeName: 'LinkupSharp.Security.Authentication.SignedOut',
	    method: function method(packet, client) {
	      client.onSignedOut(packet.Content.Session, packet.Content.Current);
	      return true;
	    }
	  }, {
	    typeName: 'LinkupSharp.Security.Authentication.AuthenticationFailed',
	    method: function method(packet, client) {
	      client.onAuthenticationFailed();
	      return true;
	    }
	  }]);

	  return sessionModule;
	};

	module.exports = {
	  create: create
	};

/***/ },
/* 3 */
/***/ function(module, exports) {

	"use strict";

	var create = function create(hnd) {
	  var handlers = [];

	  var addHandler = function addHandler(handler) {
	    handlers.push({
	      typeName: handler.typeName,
	      execute: handler.method,
	      is: function is(typeName) {
	        return handler.typeName == typeName;
	      }
	    });
	  };

	  for (var i = 0; i < hnd.length; i++) {
	    addHandler(hnd[i]);
	  }

	  var process = function process(packet, client) {
	    for (var i = 0; i < handlers.length; i++) {
	      var handler = handlers[i];
	      if (handler.is(packet.TypeName)) return handler.execute(packet, client);
	    }
	    return false;
	  };

	  return {
	    process: process
	  };
	};

	module.exports = {
	  create: create
	};

/***/ },
/* 4 */
/***/ function(module, exports) {

	"use strict";

	var getPacket = function getPacket(content) {
	  return {
	    TypeName: 'LinkupSharp.Disconnected',
	    Content: content
	  };
	};

	var reasons = {
	  none: getPacket({ Reason: 0, Description: "None" }),
	  clientRequest: getPacket({ Reason: 1, Description: "ClientRequest" }),
	  serverRequest: getPacket({ Reason: 2, Description: "ServerRequest" }),
	  anotherSessionOpened: getPacket({ Reason: 3, Description: "AnotherSessionOpened" }),
	  authenticationTimeOut: getPacket({ Reason: 4, Description: "AuthenticationTimeOut" }),
	  connectionLost: getPacket({ Reason: 5, Description: "ConnectionLost" })
	};

	module.exports = {
	  reasons: reasons
	};

/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var JsonPacketSerializer = __webpack_require__(6);
	var WebSocketClient = __webpack_require__(7).w3cwebsocket;

	var create = function create(url) {
	  var serializer = JsonPacketSerializer.create(String.fromCharCode(7, 12, 11));
	  var socket = new WebSocketClient(url, undefined, null, null, { rejectUnauthorized: false });

	  socket.onmessage = function (event) {
	    var packets = serializer.deserialize(event.data);
	    for (i = 0; i < packets.length; i++) {
	      var packet = packets[i];
	      packet.Content = JSON.parse(packet.Content);
	      //console.log(packet);
	      packetReceived(packet);
	    }
	  };

	  socket.onerror = function (error) {
	    console.log('Channel error: ' + JSON.stringify(error));
	  };

	  socket.onclose = function () {
	    closed();
	    socket = null;
	  };

	  var packetReceived = function packetReceived(packet) {};
	  var closed = function closed() {};

	  var send = function send(packet) {
	    //console.log(packet);
	    if (socket) {
	      socket.send(serializer.serialize({
	        TypeName: packet.TypeName,
	        Content: JSON.stringify(packet.Content)
	      }));
	    }
	  };

	  var close = function close() {
	    socket.close();
	  };

	  return {
	    onPacketReceived: function onPacketReceived(handler) {
	      packetReceived = handler;
	    },
	    onClosed: function onClosed(handler) {
	      closed = handler;
	    },
	    send: send,
	    close: close
	  };
	};

	module.exports = {
	  create: create
	};

/***/ },
/* 6 */
/***/ function(module, exports) {

	"use strict";

	var create = function create(token) {
	  var buffer = "";

	  var serialize = function serialize(packet) {
	    var result = JSON.stringify(packet);
	    if (token) result = result + token;
	    return result;
	  };

	  var deserialize = function deserialize(data) {
	    if (token) {
	      buffer = buffer.concat(data);
	      var packets = [];
	      var pos = buffer.indexOf(token);
	      while (pos > -1) {
	        data = buffer.slice(0, pos);
	        packets.push(JSON.parse(data));
	        buffer = buffer.slice(pos + token.length);
	        pos = buffer.indexOf(token);
	      }
	      return packets;
	    } else {
	      return [JSON.parse(data)];
	    }
	  };

	  return {
	    serialize: serialize,
	    deserialize: deserialize
	  };
	};

	module.exports = {
	  create: create
	};

/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	var _global = (function() { return this; })();
	var nativeWebSocket = _global.WebSocket || _global.MozWebSocket;
	var websocket_version = __webpack_require__(8);


	/**
	 * Expose a W3C WebSocket class with just one or two arguments.
	 */
	function W3CWebSocket(uri, protocols) {
		var native_instance;

		if (protocols) {
			native_instance = new nativeWebSocket(uri, protocols);
		}
		else {
			native_instance = new nativeWebSocket(uri);
		}

		/**
		 * 'native_instance' is an instance of nativeWebSocket (the browser's WebSocket
		 * class). Since it is an Object it will be returned as it is when creating an
		 * instance of W3CWebSocket via 'new W3CWebSocket()'.
		 *
		 * ECMAScript 5: http://bclary.com/2004/11/07/#a-13.2.2
		 */
		return native_instance;
	}


	/**
	 * Module exports.
	 */
	module.exports = {
	    'w3cwebsocket' : nativeWebSocket ? W3CWebSocket : null,
	    'version'      : websocket_version
	};


/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(9).version;


/***/ },
/* 9 */
/***/ function(module, exports) {

	module.exports = {
		"_args": [
			[
				"websocket",
				"D:\\Users\\Pablo\\Documents\\GitHub\\LinkupJS"
			]
		],
		"_from": "websocket@latest",
		"_id": "websocket@1.0.22",
		"_inCache": true,
		"_installable": true,
		"_location": "/websocket",
		"_nodeVersion": "3.3.1",
		"_npmUser": {
			"email": "brian@worlize.com",
			"name": "theturtle32"
		},
		"_npmVersion": "2.14.3",
		"_phantomChildren": {},
		"_requested": {
			"name": "websocket",
			"raw": "websocket",
			"rawSpec": "",
			"scope": null,
			"spec": "latest",
			"type": "tag"
		},
		"_requiredBy": [
			"/"
		],
		"_resolved": "https://registry.npmjs.org/websocket/-/websocket-1.0.22.tgz",
		"_shasum": "8c33e3449f879aaf518297c9744cebf812b9e3d8",
		"_shrinkwrap": null,
		"_spec": "websocket",
		"_where": "D:\\Users\\Pablo\\Documents\\GitHub\\LinkupJS",
		"author": {
			"email": "brian@worlize.com",
			"name": "Brian McKelvey",
			"url": "https://www.worlize.com/"
		},
		"browser": "lib/browser.js",
		"bugs": {
			"url": "https://github.com/theturtle32/WebSocket-Node/issues"
		},
		"config": {
			"verbose": false
		},
		"contributors": [
			{
				"name": "Iñaki Baz Castillo",
				"email": "ibc@aliax.net",
				"url": "http://dev.sipdoc.net"
			}
		],
		"dependencies": {
			"debug": "~2.2.0",
			"nan": "~2.0.5",
			"typedarray-to-buffer": "~3.0.3",
			"yaeti": "~0.0.4"
		},
		"description": "Websocket Client & Server Library implementing the WebSocket protocol as specified in RFC 6455.",
		"devDependencies": {
			"buffer-equal": "^0.0.1",
			"faucet": "^0.0.1",
			"gulp": "git+https://github.com/gulpjs/gulp.git#4.0",
			"gulp-jshint": "^1.11.2",
			"jshint-stylish": "^1.0.2",
			"tape": "^4.0.1"
		},
		"directories": {
			"lib": "./lib"
		},
		"dist": {
			"shasum": "8c33e3449f879aaf518297c9744cebf812b9e3d8",
			"tarball": "http://registry.npmjs.org/websocket/-/websocket-1.0.22.tgz"
		},
		"engines": {
			"node": ">=0.8.0"
		},
		"gitHead": "19108bbfd7d94a5cd02dbff3495eafee9e901ca4",
		"homepage": "https://github.com/theturtle32/WebSocket-Node",
		"keywords": [
			"RFC-6455",
			"client",
			"comet",
			"networking",
			"push",
			"realtime",
			"server",
			"socket",
			"websocket",
			"websockets"
		],
		"license": "Apache-2.0",
		"main": "index",
		"maintainers": [
			{
				"name": "theturtle32",
				"email": "brian@worlize.com"
			}
		],
		"name": "websocket",
		"optionalDependencies": {},
		"readme": "ERROR: No README data found!",
		"repository": {
			"type": "git",
			"url": "git+https://github.com/theturtle32/WebSocket-Node.git"
		},
		"scripts": {
			"gulp": "gulp",
			"install": "(node-gyp rebuild 2> builderror.log) || (exit 0)",
			"test": "faucet test/unit"
		},
		"version": "1.0.22"
	};

/***/ }
/******/ ]);