module.exports = function (token) {
    var self = this;
    this.token = token;
    this.buffer = "";

    this.serialize = function (packet) {
        var result = JSON.stringify(packet);
        if (self.token)
            result = result + self.token;
        return result;
    }

    this.deserialize = function (data) {
        if (self.token) {
            self.buffer = self.buffer.concat(data);
            var packets = [];
            var pos = self.buffer.indexOf(self.token);
            while (pos > -1) {
                data = self.buffer.slice(0, pos);
                packets.push(JSON.parse(data));
                self.buffer = self.buffer.slice(pos + self.token.length);
                pos = self.buffer.indexOf(self.token);
            }
            return packets;
        }
        else {
            return [JSON.parse(data)];
        }
    }
}
