//IMPORT MY MODULES------------------
var consoleSend = require('./consoleSend.js');



class gameInstance {
    constructor(gameID) {
        this.gameID = gameID
    }

    clients = []

    clientsSend = {}


    clientJoined(client) {
        
        this.clients.push(client)
    
        //Clients Send registered + transmitted + ConsoleSend
        this.clients.forEach(c => {
            this.clientsSend[c.playerID_public] = c.username
        })

        let payLoad = {
            "method": "clientJoined",
            "client": this.clientsSend
        }

        this.clients.forEach(c => {
            c.connection.send(JSON.stringify(payLoad))
            consoleSend(c.connection, client.username + " hat das Spiel betreten.", "BLUE")
        })
        //----------------------------------------

        payLoad = {
            "method": "getYourPersonalSickID",
            "personalID": client.playerID
        }
        client.connection.send(JSON.stringify(payLoad))

        

    }

}




module.exports = gameInstance