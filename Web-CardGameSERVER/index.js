//IMPORT
const http = require("http");
const websocketServer = require("websocket").server

//IMPORT MY MODULES------------------

var generate = require('./modules/generate.js');
var data = require('./modules/data')
var gameClass = require('./modules/gameClass.js')
var clientClass = require('./modules/clientClass.js')



//SERVER CREATION ----------------
const httpServer = http.createServer();
const port = process.env.PORT || 9090;


httpServer.listen(port, () => console.log("WEBSOCKET WEBGAME GESTARTET AUF PORT " + port))

const wsServer = new websocketServer({
    "httpServer": httpServer
})
//START---------------------------------



const games = {};






wsServer.on("request", request => {

    const connection = request.accept(null, request.origin);
    connection.on("resume", () => {
        console.log("Jemand hat sich mit WS verbunden.")

        
    })

    connection.on("close", () => {
        console.log("Jemand hat sich mit WS getrennt.");

    })

    connection.on("message", message => {

        const result = JSON.parse(message.utf8Data)

        if (result.method === "createGame") {

            const createGameID = generate.ID(4)

            games[createGameID] = new gameClass(createGameID)


            let payLoad = {
                "method": "createGameRes",
                "gameID": games[createGameID].gameID
            }
            
            connection.send(JSON.stringify(payLoad))
            
        }


        if(result.method === "join") {
            const createClientID = generate.ID(12)
            const joinedClient = new clientClass(createClientID, connection, result.username)
            games[result.gameID].clientJoined(joinedClient)
        }

        

    })

})



