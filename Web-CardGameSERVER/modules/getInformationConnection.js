function getInformationFromConnection(connection, games) {
    let bArr = []
    
    for (a in games) {
        games[a].clients.forEach (b=> {
            if (b.connection == connection) {
                bArr.push(b)
            }
        })
    }

    if(bArr.length = 1) {
        return {
            "gameID": a,
            "playerDetails": bArr[0]
        }


    } else {

        //WENN ES MEHR ALS ZWEI CONNECTIONS GIBT

    }

    
}

module.exports = getInformationFromConnection