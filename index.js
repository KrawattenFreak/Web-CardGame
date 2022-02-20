const res = require("express/lib/response");
const http = require("http");
const { connection } = require("websocket");
const express = require("express");
const app = express();

app.use(express.static('public'));

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/public/index.html")
    console.log(res);

})

app.listen(9091, () => console.log("Listening on http port 9091"))
const websocketServer = require("websocket").server
const httpServer = http.createServer();
httpServer.listen(9090, () => console.log("Listening.. on 9090"))
//hashmap clients
const clients = {};
const games = {};

const wsServer = new websocketServer({
    "httpServer": httpServer
})







wsServer.on("request", request => {
    //connect
    const connection = request.accept(null, request.origin);
    connection.on("resume", () => {
        console.log("opened!")
    })

    connection.on("close", () => {
        console.log("closed!");
    
    const clientId = getClientIdByConnection(connection);

    
    
    //HIER WILL ICH VERSUCHEN DIE CLIENT ID VON DEN CLIENTS GAME ZU LÖSCHEN!
    for (i in games) {
        
        games[i].clients.forEach(d => {
            if(d.clientId === clientId) {
                console.log("Der Spieler " + d.username  + " aus dem Spiel " + games[i].id + " hat das Spiel verlassen.")

                
                const index = games[i].clients.indexOf(d);

                games[i].clients.splice(index, 1); 

                const game = games[i];
                
                const payLoad = {
                    "method": "leave",
                    "game": game
                }
    

                //loop through all clients and tell them that people had joined
                game.clients.forEach(c=> {
                    clients[c.clientId].connection.send(JSON.stringify(payLoad));
                    //console.log(c.clientId + " gesendet!");
                })
            } 
        });
    }

    })

    connection.on("message", message => {

        const result = JSON.parse(message.utf8Data)
        //I have received a message from the client
        //a user wants to create a new game
        if (result.method === "create") {
            const clientId = result.clientId;
            const gameId = guid();
            games[gameId] = {
                "id": gameId,
                "clients": []
            }

            const payLoad = {
                "method": "create",
                "game" : games[gameId]
            }

            

            const con = clients[clientId].connection;
            con.send(JSON.stringify(payLoad));


        }

        if (result.method === "join") {
            
            
            const clientId = result.clientId;
            const gameId = result.gameId;
            const username = result.username;

            const game = games[gameId];

            game.clients.push({
                "clientId": clientId,
                "username": username,
                "health": null,
            })


            const payLoad = {
                "method": "join",
                "game": game,
            }



            //loop through all clients and tell them that people had joined
            game.clients.forEach(c=> {
                clients[c.clientId].connection.send(JSON.stringify(payLoad));
            })

            
        }


        if (result.method === "startGame") {
            const gameId = result.gameId;
            //Verweis auf StartGame Funktion! Yeah.
            GAME(gameId);
        }




    })

    //generate a new clientID
    const clientId = guid();
    clients[clientId] = {
        "connection": connection,
        "username": null
    }

    const payLoad = {
        "method": "connect",
        "clientId": clientId
    }
    //send back the client connect
    connection.send(JSON.stringify(payLoad))


})

const guid=()=> {
    const s4=()=> Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);     
    return `${s4() + s4()}-${s4()}-${s4()}-${s4()}-${s4() + s4() + s4()}`;
  }

function getClientIdByConnection(connectionfunction) {
    for (i in clients) {
        if (clients[i].connection === connectionfunction) {
            return i
        }
    } 
    return null
}















//_________________________________________________________________________________________
//GAME


function GAME(e) {
    const currentGame = games[e];

    //for (let i = 0; i< )


    
    const payLoad = {
        "method": "startGame",
        "cards": ["DemoKarte_12", null, null , "DemoKarte_13", null, null, "DemoKarte_26"],
        "startHealth" : 1000
    }


    currentGame.clients.forEach(c=> {
        c.health = 200;
        clients[c.clientId].connection.send(JSON.stringify(payLoad));
    })

    console.log(currentGame);


}