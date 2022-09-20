var data = require('./data')

class cardSlot {
    constructor(cardID) {

        this.CardID = cardID;
        this.locked = false;
    }

    generateRandomCard() {
        this.CardID = "DemoKarte_" + Math.floor(Math.random() * 10)
        
        
    }



}


module.exports = cardSlot