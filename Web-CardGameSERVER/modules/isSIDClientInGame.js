function isSIDClientInGame(secretID, clients) {
    
    let returnVar = false 

    for (i of clients) {
        if (i.playerID == secretID) {
            returnVar = true
        }

    }

    return returnVar
    
}

module.exports = isSIDClientInGame