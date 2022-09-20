//IMPORT MY MODULES------------------
var consoleSend = require('./consoleSend.js');
var cardClass = require('./cardClass.js');


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


    gameStart() {

        

        this.clients.forEach(c => {
            consoleSend(c.connection, "Das Spiel wurde gestartet. Mach dich Bereit!", "ORANGE")
            c.cards[0] = new cardClass()
            c.cards[1] = new cardClass()

            c.cards[0].generateRandomCard()
            c.cards[1].generateRandomCard()

            let payLoad = {
                "method": "refreshCards",
                "cards": c.cards
            }

            c.connection.send(JSON.stringify(payLoad))

        })

        console.log(this.clients)

    }

}




module.exports = gameInstance