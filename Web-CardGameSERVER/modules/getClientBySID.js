function getClientBySID (clients, SID) {
    let returnVar = null;
    clients.forEach(c => {
        if (c.playerID == SID) {
            returnVar = c
        }
    });

    return returnVar
}


module.exports = getClientBySID