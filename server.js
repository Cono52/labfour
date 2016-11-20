const net = require('net')
const os = require('os')
const toobusy = require('toobusy-js')


/*Default port*/
let port = 4000

let rooms = {}

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
	sock.setEncoding('utf8');
	if (toobusy()) {
		sock.write("ERROR_CODE: 503\n" +
			"ERROR_DESCRIPTION: Server overloaded..come back later.\n")
		sock.destroy();
	} else {
		console.log('CONNECTED: ' + sock.remoteAddress + ':' + sock.remotePort)			
		sock.on('data', function (dat) {
			data = chatMessageSplit(dat)
			console.log(data)
			if (data[0].includes("JOIN_CHATROOM:")) {
				ch.joinClient(sock, data)
			} else if (data[0].includes("LEAVE_CHATROOM:")) {
				ch.leaveRoom(sock, data)
		 	} else if (dat.includes("MESSAGE:")) {
				ch.messageRoom(sock, data)
			} else if (data[0].includes("DISCONNECT:")) {
				sock.destroy()
			} else if (data[0].includes("HELO")) {
				sock.write(data +
					"IP:" + addresses + "\n" +
					"Port:" + port + "\n" +
					"StudentID:13323109\n")
			} else if (data[0].includes("KILL_SERVICE")) {
				sock.destroy()
				server.close()
			}
		})

		sock.on('close', function (data) {
			let clientRoom
			for (var key in rooms) {
				if (rooms.hasOwnProperty(key)) {
					if (rooms[key].includes(sock)) {
						clientRoom = key
					}
				}
			}
			if (clientRoom != undefined && rooms[clientRoom].indexOf(sock) !== -1) {
				rooms[clientRoom].splice(rooms[clientRoom].indexOf(sock), 1)
				console.log('CLOSED: ' + sock.remoteAddress + ' ' + sock.remotePort)
				console.log("Clients left in " + clientRoom + ":" + rooms[clientRoom].length)
			}
		})
		sock.on('error', function (err){
			console.log(err)
		})
	}
}

const server = net.createServer(requestHandler)

server.listen(port, () => {
	console.log("Listening to port " + port)
})

server.on('error', (err) => {
	console.log("Something unexpected happend :" + err)
})


const ch = {

	joinClient: function (sock, data) {
        let comps = data
        let room_ref = comps[0].split(':')[1]
        let id = Math.floor((Math.random() * 100000) + 1)
        if (!rooms.hasOwnProperty(room_ref)) {
            rooms[room_ref] = []
            console.log("chatroom " + room_ref + " created...")
            rooms[room_ref].push(sock)
        }
        else {
            console.log("client added to existing chatroom " + room_ref)
            rooms[room_ref].push(sock)
            console.log(room_ref + " clients: " + rooms[room_ref].length)
        }
        sock.write("JOINED_CHATROOM:" + comps[0].split(':')[1] + "\n" +
            "SERVER_IP: " + addresses + "\n" +
            "PORT: " + port + "\n" +
            "ROOM_REF: " + room_ref[room_ref.length-1] + "\n" +
            "JOIN_ID: " + id + "\n")
        rooms[room_ref].forEach(sock => sock.write("CHAT: " + room_ref[room_ref.length - 1] + "\n" +
            "CLIENT_NAME: " + comps[3].split(':')[1] + "\n" +
            "MESSAGE:" + comps[3].split(':')[1] + " has joined this chatroom.\n\n"))
    },

	messageRoom: function (sock, data) {
        let comps = data
        let room_ref = " room"+comps[0].split(': ')[1]
        rooms[room_ref].forEach(sock => sock.write(comps[0] + "\n" +
            comps[2] + "\n" +
            comps[3] + "\n\n"))
    },

	leaveRoom: function (sock, data) {
        let comps = data
        let room_ref = " room" + comps[0].split(': ')[1]
        console.log(room_ref)
        sock.write("LEFT_CHATROOM: " + comps[0].split(':')[1] + "\n" +
            "JOIN_ID: " + comps[1].split(':')[1] + "\n")
	rooms[room_ref].forEach(sock => sock.write('CHAT:' + comps[0].split(': ')[1] + '\n' +
				'CLIENT_NAME:' + comps[2].split(': ')[1] + '\n' +
				'MESSAGE:' + comps[2].split(': ')[1] + ' has left this chatroom.\n\n'))
        if (rooms[room_ref].indexOf(sock) !== -1) {
            rooms[room_ref].splice(rooms[room_ref].indexOf(sock), 1)
        }
        console.log("Clients left in " + room_ref + ": " + rooms[room_ref].length + "\n")
    }

}
