const net = require('net')
const os = require('os')
const toobusy = require('toobusy-js')


/*Default port*/
let port = 4000

let clients = []

/*Try get specified port*/
if (!process.argv[2]) {
    console.log("You didnt enter a port...using port 4000")
} else {
    port = process.argv[2];
}

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

/*splits message to components*/
function chatMessageSplit(data) {
    let compData = ''
    compData += data
    let array = compData.split('\n');
    array = array.slice(0, array.length - 1)
    return array;
}

const requestHandler = (sock) => {
    if (toobusy()) {
        sock.write("ERROR_CODE: 503\n" +
            "ERROR_DESCRIPTION: Server overloaded..come back later.\n")
        sock.destroy();
    } else {
        console.log('CONNECTED: ' + sock.remoteAddress + ':' + sock.remotePort)
        sock.on('data', function(data) {
            if (data.includes("JOIN_CHATROOM:")) {
                let comps = chatMessageSplit(data)
                console.log(comps)
                let id = Math.floor((Math.random() * 100000) + 1);
                clients.push(sock)
                console.log("Clients:" + clients.length)
                sock.write("JOINED_CHATROOM:" + comps[0].split(':')[1] + "\n" +
                    "SERVER_IP: " + addresses + "\n" +
                    "PORT: " + port + "\n" +
                    "ROOM_REF: " + "1" + "\n" +
                    "JOIN_ID: " + id + "\n")
                clients.forEach(sock => sock.write("CHAT:" + comps[3].split(':')[1]+" joined room ref 1\n"))
            } else if (data.includes("MESSAGE:")) {
                let comps = chatMessageSplit(data)
                console.log(comps)
                clients.forEach(sock => sock.write(comps[0] + "\n" +
                    comps[2] + "\n" +
                    comps[3] + "\n\n"))
            } else if (data.includes("LEAVE_CHATROOM")) {
                let comps = chatMessageSplit(data)
                console.log(comps)
                clients.forEach(sock => sock.write("LEFT_CHATROOM: " + comps[0].split(':')[1] + "\n" +
                    "JOIN_ID: " + comps[1].split(':')[1] + "\n"))

                if (clients.indexOf(sock) !== -1) {
                    clients.splice(clients.indexOf(sock), 1)
                }
                console.log("Clients:" + clients.length)
            } else if (data.includes("DISCONNECT:")) {
                sock.destroy()
            } else if (data.includes("HELO")) {
                sock.write(data +
                    "IP:" + addresses + "\n" +
                    "Port:" + port + "\n" +
                    "StudentID:13323109\n")

            } else if (data.includes("KILL_SERVICE")) {
                clients.forEach(sock => sock.destroy())
                sock.destroy()
                server.close()
            }
        })

        sock.on('close', function(data) {
            if (clients.indexOf(sock) !== -1) {
                clients.splice(clients.indexOf(sock), 1)
            }
            console.log('CLOSED: ' + sock.remoteAddress + ' ' + sock.remotePort)
            console.log("Clients:" + clients.length)
        })
    }
}


const server = net.createServer(requestHandler)

server.listen(port, (err) => {
    if (err) {
        return console.log('something bad happened', err)
    }
    else {
        return console.log(`Server is listening on ${port}`)
    }
})
