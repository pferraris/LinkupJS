var SessionModule = require('./SessionModule');
var Disconnected = require('./Disconnected');

module.exports = function () {
    var self = this;
    this.channel = null;
    this.isConnected = false;
    this.sessionContext = null;
    this.disconnectionReason = null;
    this.SessionModule = new SessionModule();
    this.modules = [];

    this.connected = function () { }
    this.disconnected = function (disconnected) { }
    this.packetReceived = function (packet) { }
    this.signedIn = function () { }
    this.signedOut = function () { }
    this.authenticationFailed = function () { }

    this.connect = function (channel) {
        self.channel = channel;

        self.channel.packetReceived = function (packet) {
            if (self.SessionModule.process(packet, self))
                return;

            for (var i = 0; i < self.modules.length; i++)
                if (self.modules[i].process(packet, self))
                    return;

            self.onPacketReceived(packet);
        }

        self.channel.closed = function () {
            if (!self.disconnectionReason)
                self.disconnectionReason = Disconnected.ConnectionLost;
            self.onDisconnected(self.disconnectionReason);
        }
    }

    this.disconnect = function (reason, sendReason) {
        if (!sendReason) sendReason = true;
        if (reason)
            self.disconnectionReason = reason;
        else
            self.disconnectionReason = Disconnected.ClientRequest;
        if (self.channel) {
            if (sendReason) self.send(self.disconnectionReason);
            self.channel.close();
        }
    }

    this.send = function (packet) {
        if (self.channel) {
            if (self.sessionContext != null)
                packet.Sender = self.sessionContext.Id;
            self.channel.send(packet);
        }
    }

    this.onConnected = function () {
        self.isConnected = true;
        self.connected();
    }

    this.onDisconnected = function (disconnected) {
        self.channel.packetReceived = function (packet) { };
        self.channel.closed = function () { };
        self.channel = null;
        self.isConnected = false;
        self.disconnected(disconnected);
    }

    this.onSignedIn = function (sessionContext) {
        self.sessionContext = sessionContext;
        self.signedIn();
    }

    this.onSignedOut = function (sessionContext, current) {
        if (current) self.sessionContext = null;
        self.signedOut();
    }

    this.onAuthenticationFailed = function () {
        self.authenticationFailed();
    }

    this.onPacketReceived = function (packet) {
        self.packetReceived(packet);
    }
}
