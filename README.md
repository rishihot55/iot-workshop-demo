# iot-workshop-demo
A pair of Node.js servers which do the following:
- TCP server receives accelerometer data from a device and sends the data to the HTTP server
- HTTP server streams the accelerometer data to any browser which connects to it

The project can be set up as follows:
- `npm install`
- `node server.js`

The browser can connect to `localhost:3000` to read data from devices sending data to the TCP server.

A simulation of accelerometer data can be done by executing the following command on Linux - `bash generate-random-numbers.sh | nc localhost 1337`
