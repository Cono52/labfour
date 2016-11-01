const net = require('net')
const os = require('os')
const toobusy = require('toobusy-js')

const port = 3000
/*Get IP address*/
let interfaces = os.networkInterfaces()
let addresses = []
for (let k in interfaces) {
	for (let k2 in interfaces[k]) {
		let address = interfaces[k][k2]
		if (address.family === 'IPv4' && !address.internal) {
			addresses.push(address.address)
		}
	}
}

console.log(addresses)

const requestHandler = (sock) => {
	if(toobusy()){
		sock.destroy();
	}
	else
	{
		console.log('CONNECTED: ' + sock.remoteAddress +':'+ sock.remotePort)
		sock.on('data', function(data) {
			if(data.includes()){

			}
			else if(data.includes("KILL_SERVICE")){

			}
		})

		sock.on('close', function(data) {
			console.log('CLOSED: ' + sock.remoteAddress +' '+ sock.remotePort)
		})
	}
}


const server = net.createServer(requestHandler)

server.listen(port, (err) => {
	if (err) {
		return console.log('something bad happened', err)
	}
	console.log(`Server is listening on ${port}`)
})
