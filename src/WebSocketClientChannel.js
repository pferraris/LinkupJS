var JsonPacketSerializer = require('./JsonPacketSerializer');
var WebSocketClient = require('websocket').w3cwebsocket;

var create = function (url) {
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

  var packetReceived = function (packet) { }
  var closed = function () { }

  var send = function send(packet) {
    //console.log(packet);
    if (socket) {
      socket.send(serializer.serialize({
        TypeName: packet.TypeName,
        Content: JSON.stringify(packet.Content)
      }));
    }
  }

  var close = function close() {
    socket.close();
  }

  return {
    onPacketReceived: function(handler) {
      packetReceived = handler;
    },
    onClosed: function(handler) {
      closed = handler;
    },
    send,
    close
  }
}

module.exports = {
  create
}
