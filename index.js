var ClientConnection = require('./src/ClientConnection');
var WebSocketClientChannel = require('./src/WebSocketClientChannel');
var ClientModule = require('./src/ClientModule');

module.exports = {
    ClientConnection : ClientConnection,
    WebSocketClientChannel: WebSocketClientChannel,
    ClientModule: ClientModule,
    createClient: function() { return new ClientConnection(); },
    createChannel: function(url) { return new WebSocketClientChannel(url); }
};
