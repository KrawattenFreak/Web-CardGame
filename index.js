
const http = require("http");
const { connection } = require("websocket");




const websocketServer = require("websocket").server
const httpServer = http.createServer();
httpServer.listen(9090, () => console.log("Listening.. on 9090"))
//hashmap clients
const clients = {};
const games = {};

const wsServer = new websocketServer({
    "httpServer": httpServer
})



const damagecard = {
    "DemoKarte_0": 50,
    "DemoKarte_1": 60,
    "DemoKarte_2": 50,
    "DemoKarte_3": 30,
    "DemoKarte_4": 30,
    "DemoKarte_5": 40,
    "DemoKarte_6": 50,
    "DemoKarte_7": 10,
    "DemoKarte_8": 10,
    "DemoKarte_9": 40,
    "DemoKarte_10": 30,
    "DemoKarte_11": 110,
    "DemoKarte_12": 160,
    "DemoKarte_13": 225,
    "DemoKarte_14": 230,
    "DemoKarte_15": 650,
    "DemoKarte_16": 100,
    "DemoKarte_17": 150,
    "DemoKarte_18": 130,
    "DemoKarte_19": 240,
    "DemoKarte_20": 110,
    "DemoKarte_21": 370,
    "DemoKarte_22": 20,
    "DemoKarte_23": 40,
    "DemoKarte_24": 30,
    "DemoKarte_25": 350,
    "DemoKarte_26": 800,
    "DemoKarte_27": 550,
    "DemoKarte_28": 2000,

}



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
                "clients": [],
                "playerAmount" : null,
                "playeramZug": null,
                "gameEnded": null,
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
                "divCard" : null,
                "isDeath" : false
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

        if (result.method === "attack") {
            const gameId = result.game;
            const target = result.target;
            
            games[gameId].clients.forEach (c => {
                
                if(c.clientId == target) {
                    if(c.isDeath != true) {

                        c.health -= damagecard[result.card];

                        let payLoad = {
                            "method": "attack",
                            "damage": damagecard[result.card],
                            "target": target,
                            "isDeath": false
                        }

                        if(c.health > 0) {
                            
                            payLoad.isDeath = false

                        } else {

                            payLoad.isDeath = true
                            c.isDeath = true;
                            console.log("Der Spieler " + c.username + " ist gestorben.")
                            console.log(games[gameId]);

                        }


                        games[gameId].clients.forEach(c=> {
                            clients[c.clientId].connection.send(JSON.stringify(payLoad));
                        })
                    }

                }

            })

            //console.log(damagecard[result.card] + " an User " + result.target);

        }

        if(result.method === "finishedRound") {
            console.log("Die Game ID ist " + result.gameId)
            console.log(result.clientId);
            console.log(games[result.gameId].clients[games[result.gameId].playeramZug].clientId);

             if(result.clientId == games[result.gameId].clients[games[result.gameId].playeramZug].clientId) {
                console.log("Runde erfolgreich beendet!");
                SpielerRunde(games[result.gameId]);
             } else {
                 console.log("hacker")
             }
                
            
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

    const startHealth = 1000;
    const currentGame = games[e];
    
    const payLoad = {
        "method": "startGame",
        "cards": ["DemoKarte_2", "DemoKarte_3", null, null, null, null, null],
        "startHealth" : startHealth
    }

    currentGame.clients.forEach(c=> {
        c.health = startHealth;
        
        payLoad.cards[0] = randomCard();
        payLoad.cards[1] = randomCard();

        clients[c.clientId].connection.send(JSON.stringify(payLoad));
    })

    currentGame.gameEnded = false;
    
    currentGame.playeramZug = 0;

    currentGame.playerAmount = currentGame.clients.length - 1;

    SpielerRunde(currentGame);

}



function randomCard() {
    keys = Object.keys(damagecard)
    prop = keys[Math.floor(Math.random() * 11)]
    return prop;
}

function SpielerRunde(currentGame) {

    console.log("Runde begonnen!");
    currentGame.playerAmount = currentGame.clients.length - 1;
    console.log("Die Spieleranzahl ist " + currentGame.playerAmount);
    currentGame.playeramZug += 1;
    console.log("Momentan ist Spieler " + currentGame.playeramZug + " dran.")

    if(currentGame.playeramZug > currentGame.playerAmount) {
        currentGame.playeramZug = 0;
        console.log("Da die maximale Spieleranzahl von " + currentGame.playerAmount + " überschritten wurde, wurde nun der Playerzug auf " + currentGame.playeramZug + " gesetzt.")
    }



    const payLoadZug = {
        "method": "amZug",
        "player": currentGame.clients[currentGame.playeramZug].clientId,
        "getCard": randomCard(),
        "clients": currentGame.clients
    }


    currentGame.clients.forEach(c=> {
        clients[c.clientId].connection.send(JSON.stringify(payLoadZug));
    })

    console.log(currentGame);
    //clients[currentclients[playeramZug].clientId].connection.send(JSON.stringify(payLoadZug));
}


