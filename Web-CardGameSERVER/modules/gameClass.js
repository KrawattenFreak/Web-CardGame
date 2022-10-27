//IMPORT MY MODULES------------------
var consoleSend = require('./consoleSend.js');
var cardClass = require('./cardClass.js');
var getClientBySID = require('./getClientBySID.js');


class gameInstance {
    constructor(gameID) {
        this.gameID = gameID
        this.gameState = "opened"
    }

    clients = []

    clientsSend = {}

    playerTurn = null


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

    replaceClient(secretID, connection) {
        
        let payLoad = {
            "method": "errorAnotherSession"
        }
        
        getClientBySID(this.clients, secretID).connection.send(JSON.stringify(payLoad))

        getClientBySID(this.clients, secretID).connection.close()
        
        getClientBySID(this.clients, secretID).connection = connection
        payLoad = {
            "method": "clientJoined",
            "client": this.clientsSend
        }

        connection.send(JSON.stringify(payLoad))

        payLoad = {
            "method": "refreshCards",
            "cards": getClientBySID(this.clients, secretID).cards,
            "isGameStart": true
        }

        connection.send(JSON.stringify(payLoad))

        consoleSend(connection, "Spieler " + getClientBySID(this.clients, secretID).username + " wurde neu geladen.", "RED")
    }


    gameStart() {
        this.gameState = "ingame"
        this.clients.forEach(c => {
            consoleSend(c.connection, "Das Spiel wurde gestartet. Mach dich Bereit!", "ORANGE")
            c.cards[0] = new cardClass()
            c.cards[1] = new cardClass()

            c.cards[0].generateRandomCard()
            c.cards[1].generateRandomCard()

            let payLoad = {
                "method": "refreshCards",
                "cards": c.cards,
                "isGameStart": true,
                "officialGameStart": true
            }

            c.connection.send(JSON.stringify(payLoad))

        })

        this.playerTurn = -1
        this.nextPlayer()

    }

    nextPlayer() {    

        //Wiederholverfahren
        this.playerTurn += 1
        if(this.clients[this.playerTurn] == null) {
            this.playerTurn = 0
        }


            
        this.clients.forEach(c => {

            let payLoad = {
                "method": "playerTurn",
                "playerPublicID": this.clients[this.playerTurn].playerID_public
            }

            c.connection.send(JSON.stringify(payLoad))

        })

        

        
     
        

    }

}




module.exports = gameInstance