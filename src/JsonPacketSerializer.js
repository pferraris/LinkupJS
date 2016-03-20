var create = function (token) {
  var buffer = "";

  var serialize = function (packet) {
    var result = JSON.stringify(packet);
    if (token)
      result = result + token;
    return result;
  }

  var deserialize = function (data) {
    if (token) {
      buffer = buffer.concat(data);
      var packets = [];
      var pos = buffer.indexOf(token);
      while (pos > -1) {
        data = buffer.slice(0, pos);
        packets.push(JSON.parse(data));
        buffer = buffer.slice(pos + token.length);
        pos = buffer.indexOf(token);
      }
      return packets;
    }
    else {
      return [JSON.parse(data)];
    }
  }

  return {
    serialize,
    deserialize
  }
}

module.exports = {
  create
}
