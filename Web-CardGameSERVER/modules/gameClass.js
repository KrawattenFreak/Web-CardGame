class gameInstance {
    constructor(gameID) {
        this.gameID = gameID
    }

    //clients = {}



    //SEND MESSAGES TO ALL PLAYERS
    clientJoined(client) {
        //this.clients[client.]

        let payLoad = {
            "method": "clientJoined",
            "username": client.username,
            "playerID": client.playerID,
            //"clients": this.clients
        }

        this.clients.forEach(c => {
            c.connection.send(JSON.stringify(payLoad))
        })


    }

}




module.exports = gameInstance