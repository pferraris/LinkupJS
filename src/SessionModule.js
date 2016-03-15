var ClientModule = require('./ClientModule');

module.exports = function () {
    var clientModule = new ClientModule();

    clientModule.addHandler("LinkupSharp.Connected", function (packet, client) {
        client.onConnected();
        return true;
    });
    clientModule.addHandler("LinkupSharp.Disconnected", function (packet, client) {
        client.disconnect(packet.Content.Reason, false);
        return true;
    });
    clientModule.addHandler("LinkupSharp.Security.Authentication.SignedIn", function (packet, client) {
        client.onSignedIn(packet.Content.Session);
        return true;
    });
    clientModule.addHandler("LinkupSharp.Security.Authentication.SignedOut", function (packet, client) {
        client.onSignedOut(packet.Content.Session, packet.Content.Current);
        return true;
    });
    clientModule.addHandler("LinkupSharp.Security.Authentication.AuthenticationFailed", function (packet, client) {
        client.onAuthenticationFailed();
        return true;
    });
    
    this.process = function (packet, client) {
        return clientModule.process(packet, client);
    }
}
