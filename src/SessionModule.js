var ClientModule = require('./ClientModule');

module.exports = function () {
    this.process = ClientModule.process;
    this.addHandler = ClientModule.addHandler;

    this.addHandler("LinkupSharp.Connected", function (packet, client) {
        client.onConnected();
        return true;
    });
    this.addHandler("LinkupSharp.Disconnected", function (packet, client) {
        client.disconnect(packet.Content.Reason, false);
        return true;
    });
    this.addHandler("LinkupSharp.Security.Authentication.SignedIn", function (packet, client) {
        client.onSignedIn(packet.Content.Session);
        return true;
    });
    this.addHandler("LinkupSharp.Security.Authentication.SignedOut", function (packet, client) {
        client.onSignedOut(packet.Content.Session, packet.Content.Current);
        return true;
    });
    this.addHandler("LinkupSharp.Security.Authentication.AuthenticationFailed", function (packet, client) {
        client.onAuthenticationFailed();
        return true;
    });
}
