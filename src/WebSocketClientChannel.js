var JsonPacketSerializer = require('./JsonPacketSerializer');
var Disconnected = require('./Disconnected');
var WebSocketClient = require('websocket').w3cwebsocket;

module.exports = function (url) {
    var self = this;
    this.url = url;
    this.serializer = new JsonPacketSerializer(String.fromCharCode(7, 12, 11));

    this.socket = new WebSocketClient(url, undefined, null, null, { rejectUnauthorized: false });

    this.socket.onmessage = function (event) {
        var packets = self.serializer.deserialize(event.data);
        for (i = 0; i < packets.length; i++) {
            var packet = packets[i];
            packet.Content = JSON.parse(packet.Content);
            self.packetReceived.call(self, packet);
        }
    };

    this.socket.onerror = function (error) {
        console.log('Channel error: ' + JSON.stringify(error));
    };

    this.socket.onclose = function () {
        self.closed.call(self);
        self.socket = null;
    };
    
    this.packetReceived = function (packet) { }
    this.closed = function () { }

    this.send = function send(packet) {
        if (self.socket) {
            self.socket.send(self.serializer.serialize({
                TypeName: packet.TypeName,
                Content: JSON.stringify(packet.Content) 
            }));
        }
    }

    this.close = function close() {
        self.socket.close();
    }
}
