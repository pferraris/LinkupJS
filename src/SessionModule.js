var ClientModule = require('./ClientModule');

var create = function() {
  var sessionModule = ClientModule.create([
    {
      typeName: 'LinkupSharp.Connected',
      method: function (packet, client) {
        client.onConnected();
        return true;
      }
    },
    {
      typeName: 'LinkupSharp.Disconnected',
      method: function (packet, client) {
        client.disconnect(packet.Content.Reason, false);
        return true;
      }
    },
    {
      typeName: 'LinkupSharp.Security.Authentication.SignedIn',
      method: function (packet, client) {
        client.onSignedIn(packet.Content.Session);
        return true;
      }
    },
    {
      typeName: 'LinkupSharp.Security.Authentication.SignedOut',
      method: function (packet, client) {
        client.onSignedOut(packet.Content.Session, packet.Content.Current);
        return true;
      }
    },
    {
      typeName: 'LinkupSharp.Security.Authentication.AuthenticationFailed',
      method: function (packet, client) {
        client.onAuthenticationFailed();
        return true;
      }
    },
  ]);

  return sessionModule;
}

module.exports = {
  create
};
