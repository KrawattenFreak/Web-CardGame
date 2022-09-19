class playerInstance {
    constructor(playerID, connection, username, playerID_public) {
        this.playerID = playerID
        this.playerID_public = playerID_public
        this.connection = connection
        this.username = username

        this.cards = [];
        for (let i = 0; i < 9; i++) {
            this.cards[i] = null
        }

    }

    

    

}




module.exports = playerInstance