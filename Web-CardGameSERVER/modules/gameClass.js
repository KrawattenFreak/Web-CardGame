//IMPORT MY MODULES------------------
var consoleSend = require('./consoleSend.js');



class gameInstance {
    constructor(gameID) {
        this.gameID = gameID
    }

    clients = []

    clientsSend = {}

    //SEND MESSAGES TO ALL PLAYERS
    clientJoined(client) {
        this.clients.push(client)
    

        this.clients.forEach(c => {
            this.clientsSend[c.playerID_public] = c.username
        })

        let payLoad = {
            "method": "clientJoined",
            "client": this.clientsSend
        }

        this.clients.forEach(c => {
            c.connection.send(JSON.stringify(payLoad))
        })

        payLoad = {
            "method": "getYourPersonalSickID",
            "personalID": client.playerID
        }
        client.connection.send(JSON.stringify(payLoad))

        consoleSend(this, "Na schön", "RED")

    }

}




module.exports = gameInstance