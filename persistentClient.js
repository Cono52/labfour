let net = require('net')

let HOST = '0.0.0.0'
let PORT = 3000

let client = new net.Socket()

let join = function() {
    client.write("JOIN_CHATROOM: room1\n" +
        "CLIENT_IP: 192.127.1.6\n" +
        "PORT: 0\n" +
        "CLIENT_NAME: cono52\n")
}

let message = function() {
    client.write("CHAT: room1\n" +
        "JOIN_ID: 192.127.1.6\n" +
        "CLIENT_ID: cono52\n" +
        "MESSAGE: Ullamcorper sem eu dui, curabitur vitae nulla, vulputate magna imperdiet at egestas.\n\n")
}

let leave = function() {
    client.write("LEAVE_CHATROOM: 1\n" +
        "JOIN_ID: 1\n" +
        "CLIENT_NAME: cono52\n")
}

let terminate = function() {
    client.write("DISCONNECT: 0" + "\n" +
        "PORT: 0" + "\n" +
        "CLIENT_NAME: cono52\n")
}

client.connect(PORT, HOST, function() {
    setTimeout(join, 1000)
})

// Add a 'data' event handler for the client socket
// data is what the server sent to this socket
client.on('data', function(data) {
    console.log("" + data)
})

// Add a 'close' event handler for the client socket
client.on('close', function() {
    console.log('Connection closed')
})
