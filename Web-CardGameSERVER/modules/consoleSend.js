function consoleOutput(connection, message, color) {
    
    let consolePayLoad = {
        "method": "consoleOutput",
        "message": message,
        "color": color
    }

    connection.send(JSON.stringify(consolePayLoad))
    

}
module.exports = consoleOutput