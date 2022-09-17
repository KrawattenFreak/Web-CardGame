function consoleOutput(game, message, color) {
    
    let consolePayLoad = {
        "method": "consoleOutput",
        "message": message,
        "color": color
    }

    game.clients.forEach(c => {
        c.connection.send(JSON.stringify(consolePayLoad))
    })

}
module.exports = consoleOutput