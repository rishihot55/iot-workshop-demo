// Dependencies for the readings server
"use strict";
const net = require('net');
const MessageQueue = require('./message-queue');

// Dependencies for the http server
const app = require('express')();
const httpServer = require('http').Server(app);
const express = require('express');
app.use(express.static('canvasjs-1.8.5'));

const mustacheExpress = require('mustache-express');
const io = require('socket.io')(httpServer);

const config = {
	host: 'localhost',
	port: '1337'
};

let id = 0;
let mq = new MessageQueue();

const readingServer = net.createServer((socket) => {
	id+= 1;
	let localId = id;
	console.log(socket.remoteAddress,":", socket.remotePort, " just connected");
	socket.setEncoding('utf8');
	socket.on('data', (data) => {
		let splitData = data.split(',');
		if (splitData.length == 3) {
			let reading = {
				id: localId,
				x: splitData[0],
				y: splitData[1],
				z: splitData[2]
			};
			console.log(
				`Data sent by ${reading.id} - `+
				`x: ${reading.x}, `+
				`y: ${reading.y}, `+
				`z: ${reading.z}`);
			mq.push(reading);
		}
	});
	socket.on('end', (had_err) => {
		console.log(`${localId} just disconnected`);
	});
}).on('error', (err) => {
	throw err;
});

readingServer.listen(config, () => {
	console.log('Reading server running on port', readingServer.address().port);
});

// HTTP server
const appConfig = {
	port: 3000
};

app.engine('mustache', mustacheExpress());
app.set('views', __dirname + '/views');
app.set('view engine', 'mustache');
app.disable('view cache');

httpServer.listen(appConfig.port, function() {
	console.log('App listening on port', appConfig.port);
});

app.get('/', function(req, res) {
	res.render('index');
});

io.on('connection', function(socket) {
	console.log('A new client connected');
	mq.on('push', (reading) => {
		console.log("Sending reading", reading);
		socket.emit('reading', reading);
	});
})
