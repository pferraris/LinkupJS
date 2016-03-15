module.exports = function () {
    var self = this;
    this.handlers = [];

    this.addHandler = function (typeName, handler) {
        self.handlers.push({
            typeName: typeName,
            execute: handler,
            is: function (typeName) {
                return (this.typeName == typeName)
            }
        });
    }

    this.process = function (packet, client) {
        for (var i = 0; i < self.handlers.length; i++) {
            var handler = self.handlers[i];
            if (handler.is(packet.TypeName))
                return handler.execute(packet, client);
        }
        return false;
    }
}
