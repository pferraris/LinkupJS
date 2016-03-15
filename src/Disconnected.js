var getPacket = function (content) {
    return {
        TypeName: 'LinkupSharp.Disconnected',
        Content: content
    }
}

module.exports = {
    None:                  getPacket({ Reason: 0, Description: "None"}),
    ClientRequest:         getPacket({ Reason: 1, Description: "ClientRequest"}),
    ServerRequest:         getPacket({ Reason: 2, Description: "ServerRequest"}),
    AnotherSessionOpened:  getPacket({ Reason: 3, Description: "AnotherSessionOpened"}),
    AuthenticationTimeOut: getPacket({ Reason: 4, Description: "AuthenticationTimeOut"}),
    ConnectionLost:        getPacket({ Reason: 5, Description: "ConnectionLost"})
};
