// Dependencies for the readings server
const net = require('net');
const MessageQueue = require('./message-queue');

// Dependencies for the http server
const express = require('express');
const app = express();
const httpServer = require('http').Server(app);

const mustacheExpress = require('mustache-express');
const io = require('socket.io')(httpServer);

const config = {
	host: '0.0.0.0',
	port: '5000'
};

let id = 0;
let mq = new MessageQueue();

function calcDistance(s, v, a, t) {
	return s + (v + 0.5*a*t)*t;
}

function calcVelocity(v, a, t) {
	return (v + a*t);
}

const readingServer = net.createServer((socket) => {
	id+= 1;
	let localId = id;

	let ballCoordinates = {
		x: 400,
		y: 400
	};

	let velocity = {
		x: 0,
		y: 0
	};
	let deltaT = 0.01;
	console.log(socket.remoteAddress,":", socket.remotePort, " just connected");

	socket.setEncoding('utf8');
	socket.on('data', (data) => {
		let splitData = data.split(',');
		if (splitData.length == 3) {
			let reading = {
				x: ballCoordinates.x, 
				y: ballCoordinates.y,
				id: localId
			};

			console.log(
				`Data sent by ${reading.id} - `+
				`x: ${reading.x}, `+
				`y: ${reading.y}, `
			);

			mq.push(reading);

			let acceleration = {x: splitData[0], y: splitData[1]};

			ballCoordinates.x = calcDistance(ballCoordinates.x, velocity.x, acceleration.x, deltaT);
			ballCoordinates.y =  calcDistance(ballCoordinates.y, velocity.y, acceleration.y, deltaT);

			velocity.x = calcVelocity(velocity.x, acceleration.x, deltaT);
			velocity.y = calcVelocity(velocity.y, acceleration.y, deltaT);
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
app.use(express.static('public'));

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
