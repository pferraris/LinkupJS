var SessionModule = require('./SessionModule');
var Disconnected = require('./Disconnected');

var create = function() {
  var channel = null;
  var isConnected = false;
  var sessionContext = null;
  var disconnectionReason = null;
  var sessionModule = SessionModule.create();
  var modules = [];

  var connected = function() { }
  var disconnected = function(disconnected) { }
  var packetReceived = function(packet) { }
  var signedIn = function() { }
  var signedOut = function() { }
  var authenticationFailed = function() { }

  var onConnected = function() {
    isConnected = true;
    connected();
  }

  var onDisconnected = function(disconnectionReason) {
    channel.packetReceived = function (packet) { };
    channel.closed = function () { };
    channel = null;
    isConnected = false;
    disconnected(disconnectionReason);
  }

  var onSignedIn = function(sessionContext) {
    sessionContext = sessionContext;
    signedIn();
  }

  var onSignedOut = function(sessionContext, current) {
    if (current) sessionContext = null;
    signedOut();
  }

  var onAuthenticationFailed = function() {
    authenticationFailed();
  }

  var onPacketReceived = function(packet) {
    packetReceived(packet);
  }

  var connect = function(ch) {
    channel = ch;
    var client = this;
    var auth = {
      onConnected,
      onDisconnected,
      onSignedIn,
      onSignedOut,
      onAuthenticationFailed
    };

    channel.onPacketReceived(function(packet) {
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

    channel.onClosed(function() {
      if (!disconnectionReason) {
        disconnectionReason = Disconnected.reasons.connectionLost;
      }
      onDisconnected(disconnectionReason);
    });
  }

  var disconnect = function(reason, sendReason) {
    if (!sendReason) sendReason = true;
    if (reason) {
      disconnectionReason = reason;
    }
    else {
      disconnectionReason = Disconnected.reasons.clientRequest;
    }
    if (channel) {
      if (sendReason) send(disconnectionReason);
      channel.close();
    }
  }

  var send = function(packet) {
    if (channel) {
      if (sessionContext != null) {
        packet.Sender = sessionContext.Id;
      }
      channel.send(packet);
    }
  }

  return {
    isConnected,
    sessionContext,
    connect,
    disconnect,
    send,
    addModule: function(module) {
      modules.push(module);
    },
    onConnected: function(handler) {
      connected = handler;
    },
    onDisconnected: function(handler) {
      disconnected = handler;
    },
    onPacketReceived: function(handler) {
      packetReceived = handler;
    },
    onSignedIn: function(handler) {
      signedIn = handler;
    },
    onSignedOut: function(handler) {
      signedOut = handler;
    },
    onAuthenticationFailed: function(handler) {
      authenticationFailed = handler;
    }
  }
}

module.exports = {
  create
}
