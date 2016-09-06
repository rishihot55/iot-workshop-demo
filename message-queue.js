function MessageQueue() {
	this.listbase = [];
	this.events = [];
};

MessageQueue.prototype.on = function(name, callback) {
	this.events.push({
		name: name,
		callback: callback
	});
}

MessageQueue.prototype.push = function(item) {
	this.listbase.push(item);
	this._emit("push", item);
}

MessageQueue.prototype.pop = function() {
	return listbase.shift();
}

MessageQueue.prototype._emit = function(evtName, data){
	this.events.forEach(function(event) {
		if (evtName == event.name) {
			event.callback.call(null, data, this.listbase);
		}
	})
}

module.exports = MessageQueue;