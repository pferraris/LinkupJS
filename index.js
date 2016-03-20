var ClientConnection = require('./src/ClientConnection');
var WebSocketClientChannel = require('./src/WebSocketClientChannel');
var ClientModule = require('./src/ClientModule');

var LinkupJS = {
  createClient: ClientConnection.create,
  createChannel: WebSocketClientChannel.create,
  createModule: ClientModule.create
}

module.exports = LinkupJS;
