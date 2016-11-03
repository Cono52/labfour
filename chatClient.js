let net = require('net')

let HOST = '192.168.1.7'
let PORT = 3000

let client = new net.Socket()
client.connect(PORT, HOST, function() {
	client.write("HELO BASE_TEST\n")
	client.write("JOIN_CHATROOM: room1\n"
			+"CLIENT_IP: 192.127.1.6\n"
			+"PORT: 3000\n"
			+"CLIENT_NAME: cono52\n")
})

// Add a 'data' event handler for the client socket
// data is what the server sent to this socket
client.on('data', function(data) {
	console.log(""+data)
})

// Add a 'close' event handler for the client socket
client.on('close', function() {
	console.log('Connection closed')
})
