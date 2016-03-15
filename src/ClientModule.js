module.exports = {
    addHandler: function (typeName, handler) {
        if (!this.handlers)
            this.handlers = [];
        this.handlers.push({
            typeName: typeName,
            execute: handler,
            is: function (typeName) {
                return (this.typeName == typeName)
            }
        });
    },
    process: function (packet, client) {
        if (!this.handlers)
            return false;
        for (var i = 0; i < this.handlers.length; i++) {
            var handler = this.handlers[i];
            if (handler.is(packet.TypeName))
                return handler.execute(packet, client);
        }
        return false;
    }
}
