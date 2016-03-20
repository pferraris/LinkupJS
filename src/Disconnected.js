var getPacket = function (content) {
  return {
    TypeName: 'LinkupSharp.Disconnected',
    Content: content
  }
}

var reasons = {
  none:                  getPacket({ Reason: 0, Description: "None"}),
  clientRequest:         getPacket({ Reason: 1, Description: "ClientRequest"}),
  serverRequest:         getPacket({ Reason: 2, Description: "ServerRequest"}),
  anotherSessionOpened:  getPacket({ Reason: 3, Description: "AnotherSessionOpened"}),
  authenticationTimeOut: getPacket({ Reason: 4, Description: "AuthenticationTimeOut"}),
  connectionLost:        getPacket({ Reason: 5, Description: "ConnectionLost"})
};

module.exports = {
  reasons
};
