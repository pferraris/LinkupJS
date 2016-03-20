var create = function(hnd) {
  var handlers = [];

  var addHandler = function (handler) {
    handlers.push({
      typeName: handler.typeName,
      execute: handler.method,
      is: function (typeName) {
        return (handler.typeName == typeName)
      }
    });
  };

  for (var i = 0; i < hnd.length; i++) {
    addHandler(hnd[i]);
  }

  var process = function (packet, client) {
    for (var i = 0; i < handlers.length; i++) {
      var handler = handlers[i];
      if (handler.is(packet.TypeName))
      return handler.execute(packet, client);
    }
    return false;
  };

  return {
    process
  };
}

module.exports = {
  create
};
