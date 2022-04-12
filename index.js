
const res = require("express/lib/response");
const { redirect } = require("express/lib/response");
const http = require("http");
const { connection } = require("websocket");

const websocketServer = require("websocket").server
const httpServer = http.createServer();
const port = process.env.PORT || 9090;

//
httpServer.listen(port, () => console.log("WEBSOCKET GESTARTET AUF PORT " + port))

//hashmap clients
const clients = {};
const games = {};

const wsServer = new websocketServer({
    "httpServer": httpServer
})

const specialCards = {
    "DemoKarte_-1": 60,
    "DemoKarte_-2": 50,
    "DemoKarte_-3": 30,
    "DemoKarte_-4": 30,
    "DemoKarte_-5": 40,
    "DemoKarte_-6": 50,
    "DemoKarte_-7": 10,
    "DemoKarte_-8": 10,
    "DemoKarte_-9": 40,
    "DemoKarte_-10": 30,
    "DemoKarte_-11": 110,
}

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

const cardNameDictionary = {
    "DemoKarte_0": "Mysteriöser Molch",
    "DemoKarte_1": "Zerstückelter Zombie",
    "DemoKarte_2": "Marcel Davis",
    "DemoKarte_3": "1&1 WLAN-Router",
    "DemoKarte_4": "Der Franzose",
    "DemoKarte_5": "Der Inder",
    "DemoKarte_6": "Arató András István",
    "DemoKarte_7": "Nyan Cat",
    "DemoKarte_8": "Bongo Cat",
    "DemoKarte_9": "Hässlicher Hase",
    "DemoKarte_10": "Kleiner Kobold",
    "DemoKarte_11": "Behinderter Bär",
    "DemoKarte_12": "Mieser Mupf",
    "DemoKarte_13": "Rotes Reh",
    "DemoKarte_14": "Riesen Raupe",
    "DemoKarte_15": "Krasse Kämpfer",
    "DemoKarte_16": "1&1 Firma",
    "DemoKarte_17": "Freiheitsstatue",
    "DemoKarte_18": "Domme",
    "DemoKarte_19": "Donald Trump",
    "DemoKarte_20": "Psycho Andreas",
    "DemoKarte_21": "Axel Voss",
    "DemoKarte_22": "Knuddelkatze",
    "DemoKarte_23": "Cat Fish",
    "DemoKarte_24": "Fette Katze",
    "DemoKarte_25": "Sonkgylottischer Praktikant",
    "DemoKarte_26": "Sonkgylotte",
    "DemoKarte_27": "Error",
    "DemoKarte_28": "Gott",
    "DemoKarte_-1": "Diebstahl",
    "DemoKarte_-2": "Spende",
    "DemoKarte_-3": "Heilung 1",
    "DemoKarte_-4": "HP-Booster",
    "DemoKarte_-5": "Heilung 2",
    "DemoKarte_-6": "Revive Karte",
    "DemoKarte_-7": "Spionage",
    "DemoKarte_-8": "Vorhängeschloss",
    "DemoKarte_-9": "Taubheit",
    "DemoKarte_-10": "Salzwunde",
    "DemoKarte_-11": "Spigghel"
};



wsServer.on("request", request => {
    //connect
    const connection = request.accept(null, request.origin);
    connection.on("resume", () => {
        //console.log("opened!")
    })

    connection.on("close", () => {
        //console.log("closed!");
    
    const clientId = getClientIdByConnection(connection);

    
    
    //HIER WILL ICH VERSUCHEN DIE CLIENT ID VON DEN CLIENTS GAME ZU LÖSCHEN!
    for (i in games) {
        
        games[i].clients.forEach(d => {
            if(d.clientId === clientId) {
                //console.log("Der Spieler " + d.username  + " aus dem Spiel " + games[i].id + " hat das Spiel verlassen.")

                
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
                "currentThiefSender": null,
                "currentCardStealed": null,
                "currentSpionSender": null
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
            
            let validGameID = true;
            
            //for (h in games) {
            //    if(h.id == gameId) {
            //        validGameID = true;
            //    }
            //}
            

            if(validGameID == true) {

                const game = games[gameId];

                game.clients.push({
                    "clientId": clientId,
                    "username": username,
                    "health": null,
                    "divCard" : null,
                    "isDeath" : false,
                    "specialcardState": 0,
                    "healthMax": 2000,
                    "taubheitLeft": 0,
                    "salzwunde": false,
                    "spigghel": false
                })


                const payLoad = {
                    "method": "join",
                    "game": game,
                }



                //loop through all clients and tell them that people had joined
                game.clients.forEach(c=> {
                    clients[c.clientId].connection.send(JSON.stringify(payLoad));
                })

                let payload = {
                    "method": "consoleOutput",
                    "message": username + " hat das Spiel betreten.",
                    "color": "purple"
                };
                games[gameId].clients.forEach(g=> {
                        clients[g.clientId].connection.send(JSON.stringify(payload));
                
                })

            } else {
                console.log("Hacker")
            }
            
            
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
                        
                        //WIE SOLL DAS FUNKTUIOBNUERENE=?????? 


                        if(result.card.slice(10, 11) !== "-") {

                            let payLoadd = {
                                "method": "attack",
                                "damage": damagecard[result.card],
                                "target": target,
                                "isDeath": false
                            }
                            // PAYLOADD WIRD IM UNTEREN CODE ENTSPRECHEN BEARBEITET

                            //KEIN SPIEGEL
                            if(c.spigghel == false) {
                                //CONSOLE
                                let payload = {
                                    "method": "consoleOutput",
                                    "message": "Du wurdest angegriffen!",
                                    "color": "red"
                                };

                                if(c.taubheitLeft > 0) {
                                    c.taubheitLeft -= 1;
                                } else {
                                    clients[c.clientId].connection.send(JSON.stringify(payload));
                                }


                                if(c.salzwunde == true) {
                                    c.health -= 2 * damagecard[result.card];
                                    c.salzwunde = false;
                                    //CONSOLE
                                    let payload = {
                                        "method": "consoleOutput",
                                        "message": "Du erleidest durch eine Salzwunde doppelten Schaden!",
                                        "color": "red"
                                    };

                                    if(c.taubheitLeft > 0) {
                                        c.taubheitLeft -= 1;
                                    } else {
                                        clients[c.clientId].connection.send(JSON.stringify(payload));
                                    }

                                    payLoadd.damage = 2 * damagecard[result.card]; 
                                    

                                } else {
                                    c.health -= damagecard[result.card];
                                }

                                games[gameId].clients.forEach (f => {
                                
                                    if(f.clientId == result.sender) {
                                        
                                        //ANGRIFF-CONSOLE
                                        let payLoad = {
                                            "method": "consoleOutput",
                                            "message": c.username + " wurde von " + f.username + " angegriffen.",
                                            "color": "black"
                                        };
                                        games[gameId].clients.forEach(g=> {
                                            if(g.taubheitLeft > 0) {
                                                g.taubheitLeft -= 1;
                                            } else {
                                                clients[g.clientId].connection.send(JSON.stringify(payLoad));
                                            }
                                        })
                                    }
                                })

                                //BEARBEITUNG
                                if(c.health > 0) {

                                    payLoadd.isDeath = false
    
                                } else {
    
                                    payLoadd.isDeath = true
                                    c.isDeath = true;
                                }

                            // MIT SPIEGEL
                            } else {
                                games[gameId].clients.forEach (e => {
                                    if(e.clientId == result.sender) {
                
                                        //SPIGGHEL ANGRIFF ZURÜCK AUF SENDER


                                        let payload = {
                                            "method": "consoleOutput",
                                            "message": "Du hast dich wegen eines Spiegels selber verletzt!",
                                            "color": "red"
                                        };
                                    
                                        if(e.taubheitLeft > 0) {
                                            e.taubheitLeft -= 1;
                                        } else {
                                            clients[e.clientId].connection.send(JSON.stringify(payload));
                                        }

                                        payLoadd.target = e.clientId;
                                    
                                    
                                        if(e.salzwunde == true) {
                                            e.health -= 2 * damagecard[result.card];
                                            e.salzwunde = false;
                                            //CONSOLE
                                            let payload = {
                                                "method": "consoleOutput",
                                                "message": "Du erleidest durch eine Salzwunde doppelten Schaden!",
                                                "color": "red"
                                            };
                                        
                                            if(e.taubheitLeft > 0) {
                                                e.taubheitLeft -= 1;
                                            } else {
                                                clients[e.clientId].connection.send(JSON.stringify(payload));
                                            }

                                            payLoadd.damage = 2 * damagecard[result.card]; 
                                        
                                        } else {
                                            e.health -= damagecard[result.card];
                                        }


                                                
                                        //ANGRIFF-CONSOLE
                                        let payLoad = {
                                            "method": "consoleOutput",
                                            "message": e.username + " hat sich aufgrund eines Spiegels selber verletzt.",
                                            "color": "black"
                                        };
                                        games[gameId].clients.forEach(g=> {
                                            if(g.taubheitLeft > 0) {
                                                g.taubheitLeft -= 1;
                                            } else {
                                                clients[g.clientId].connection.send(JSON.stringify(payLoad));
                                            }
                                        })

                                        //BEARBEITUNG
                                        if(e.health > 0) {

                                            payLoadd.isDeath = false
            
                                        } else {
            
                                            payLoadd.isDeath = true
                                            e.isDeath = true;
                                        }
                                    }

                                })

                                c.spigghel = false;
                            }
                            
                            

                            games[gameId].clients.forEach(e=> {
                                clients[e.clientId].connection.send(JSON.stringify(payLoadd));
                            })

                            


                        } else {

                            //AUSFÜHRUNG EINER SPECIAL CARD

                            //console.log("Eine Special Karte wurde eingesetzt.")

                            if(result.card == "DemoKarte_-1") {

                                //console.log("Es wurde die erste Karte genommen")

                                const payLoad = {
                                    "method": "thieftarget"
                                }

                                clients[result.target].connection.send(JSON.stringify(payLoad));

                                //CONSOLE
                                let payload = {
                                    "method": "consoleOutput",
                                    "message": "Dir wurde eine Karte gestohlen!",
                                    "color": "red"
                                };
                                games[gameId].clients.forEach(e=> {
                                    if (e.clientId == result.target) {
                                        if(e.taubheitLeft > 0) {
                                            e.taubheitLeft -= 1;
                                        } else {
                                            clients[e.clientId].connection.send(JSON.stringify(payload));
                                        }
                                    }
                                    
                                })

                                games[gameId].currentThiefSender = result.sender;
                                //console.log(games[gameId].currentThiefSender);

                                games[gameId].clients.forEach (e => {
                                    
                                    if(e.clientId == result.sender) {
                                        let payLoad = {
                                            "method": "consoleOutput",
                                            "message": "Dieb wurde eingesetzt!",
                                            "color": "#00b300"
                                        };
                                        clients[e.clientId].connection.send(JSON.stringify(payLoad));
                                    }
                                })

                            }

                            if(result.card == "DemoKarte_-3") {

                                c.health += 100;

                                let payLoad = {
                                    "method": "attack",
                                    "damage": -100,
                                    "target": target,
                                    "isDeath": c.isDeath
                                }


                                games[gameId].clients.forEach(e=> {
                                    clients[e.clientId].connection.send(JSON.stringify(payLoad));
                                })

                                games[gameId].clients.forEach (e => {
                                    
                                    if(e.clientId == result.sender) {
                                        let payLoad = {
                                            "method": "consoleOutput",
                                            "message": "Heilung 1 wurde eingesetzt!",
                                            "color": "#00b300"
                                        };
                                        clients[e.clientId].connection.send(JSON.stringify(payLoad));
                                    }
                                })
                            }

                            if(result.card == "DemoKarte_-5") {

                                c.health += 500;

                                let payLoad = {
                                    "method": "attack",
                                    "damage": -500,
                                    "target": target,
                                    "isDeath": c.isDeath
                                }


                                games[gameId].clients.forEach(e=> {
                                    clients[e.clientId].connection.send(JSON.stringify(payLoad));
                                })

                                games[gameId].clients.forEach (e => {
                                    
                                    if(e.clientId == result.sender) {
                                        let payLoad = {
                                            "method": "consoleOutput",
                                            "message": "Heilung 2 wurde eingesetzt!",
                                            "color": "#00b300"
                                        };
                                        clients[e.clientId].connection.send(JSON.stringify(payLoad));
                                    }
                                })
                            }

                            if(result.card == "DemoKarte_-4") {

                                c.healthMax += 500;

                                let payLoad = {
                                    "method": "healMax",
                                    "maxhealth": c.healthMax,
                                    "target": target
                                }


                                games[gameId].clients.forEach(e=> {
                                    clients[e.clientId].connection.send(JSON.stringify(payLoad));
                                })

                                games[gameId].clients.forEach (e => {
                                    
                                    if(e.clientId == result.sender) {
                                        let payLoad = {
                                            "method": "consoleOutput",
                                            "message": "Erhöhung der maximalen Heilung wurde eingesetzt!",
                                            "color": "#00b300"
                                        };
                                        clients[e.clientId].connection.send(JSON.stringify(payLoad));
                                    }
                                })

                            }

                            if(result.card == "DemoKarte_-9") {

                                games[gameId].clients.forEach(e=> {
                                    if(e.clientId == target) {
                                        e.taubheitLeft = 5;
                                    }
                                })


                                games[gameId].clients.forEach (e => {
                                    
                                    if(e.clientId == result.sender) {
                                        let payLoad = {
                                            "method": "consoleOutput",
                                            "message": "Taubheit wurde eingesetzt!",
                                            "color": "#00b300"
                                        };
                                        clients[e.clientId].connection.send(JSON.stringify(payLoad));
                                    }
                                })
                            }

                            if(result.card == "DemoKarte_-7") {
                                
                                games[gameId].clients.forEach(e=> {
                                    if(e.clientId == target) {

                                        let payLoad = {
                                            "method": "showCardsBecauseSpion"
                                        }

                                        clients[e.clientId].connection.send(JSON.stringify(payLoad))


                                        games[gameId].clients.forEach (f => {
                                    
                                            if(f.clientId == result.sender) {
                                                let payLoad = {
                                                    "method": "consoleOutput",
                                                    "message": "Spionage wurde für " + e.username + " eingesetzt:",
                                                    "color": "#00b300"
                                                };
                                                clients[f.clientId].connection.send(JSON.stringify(payLoad));
                                                
                                                games[gameId].currentSpionSender = f.clientId;
                                                
                                            }
                                        })


                                    }
                                })


                                

                            }

                            if(result.card == "DemoKarte_-10") {

                                c.salzwunde = true;


                                games[gameId].clients.forEach (e => {
                                    
                                    if(e.clientId == result.sender) {
                                        let payLoad = {
                                            "method": "consoleOutput",
                                            "message": "Salzwunde wurde eingesetzt!",
                                            "color": "#00b300"
                                        };
                                        clients[e.clientId].connection.send(JSON.stringify(payLoad));
                                    }
                                })
                            }

                            if(result.card == "DemoKarte_-11") {

                                c.spigghel = true;


                                games[gameId].clients.forEach (e => {
                                    
                                    if(e.clientId == result.sender) {
                                        let payLoad = {
                                            "method": "consoleOutput",
                                            "message": "Spigghel wurde eingesetzt!",
                                            "color": "#00b300"
                                        };
                                        clients[e.clientId].connection.send(JSON.stringify(payLoad));
                                    }
                                })
                            }

                        }
                    }

                    //SPECIAL CARDS AUCH WENN TOT

                    if(result.card == "DemoKarte_-2") {

                        const payLoad = {
                            "method": "spentCard",
                            "card": result.spentCard
                        }

                        clients[result.target].connection.send(JSON.stringify(payLoad));

                        games[gameId].clients.forEach (e => {
                                    
                            if(e.clientId == result.sender) {
                                let payLoad = {
                                    "method": "consoleOutput",
                                    "message": "Karte wurde gespendet!",
                                    "color": "#00b300"
                                };
                                clients[e.clientId].connection.send(JSON.stringify(payLoad));
                            }
                        })

                    }

                    if(result.card == "DemoKarte_-6") {
                        c.isDeath = false;
                        c.health = 200;

                        let payLoad = {
                            "method": "revived",
                            "target": target
                        }

                        games[gameId].clients.forEach(c=> {
                            clients[c.clientId].connection.send(JSON.stringify(payLoad));
                        })
                        games[gameId].clients.forEach (e => {
                                    
                            if(e.clientId == result.sender) {
                                let payLoad = {
                                    "method": "consoleOutput",
                                    "message": "Wiederbeleben wurde eingesetzt!",
                                    "color": "#00b300"
                                };
                                clients[e.clientId].connection.send(JSON.stringify(payLoad));
                            }
                        })

                    }

                }

            })

            //console.log(damagecard[result.card] + " an User " + result.target);

        }

        if(result.method === "finishedRound") {
            //console.log("Die Game ID ist " + result.gameId)
            //console.log(result.clientId);
            //console.log(games[result.gameId].clients[games[result.gameId].playeramZug].clientId);

             if(result.clientId == games[result.gameId].clients[games[result.gameId].playeramZug].clientId) {
                //console.log("Runde erfolgreich beendet!");
                SpielerRunde(games[result.gameId]);
             } else {
                 //console.log("hacker")
             }
                
            
        }

        if (result.method === "thiefResClient") {

            const gameId = result.game;

            const payLoad = {
                "method": "thiefResToSender",
                "receivedCard": result.card
            }

            clients[games[gameId].currentThiefSender].connection.send(JSON.stringify(payLoad));
            
            if (result.CardWasAvailable == false) {
                let payLoad = {
                    "method": "consoleOutput",
                    "message": "Es wurde keine Karte gefunden.",
                    "color": "orange"
                };
                clients[games[gameId].currentThiefSender].connection.send(JSON.stringify(payLoad));
            } else {
                let payLoad = {
                    "method": "consoleOutput",
                    "message": "Du hast die Karte " + cardNameDictionary[result.card] + " gestohlen.",
                    "color": "green"
                };
                clients[games[gameId].currentThiefSender].connection.send(JSON.stringify(payLoad));
            }
            //console.log(result.CardWasAvailable)

        }

        if (result.method === "ForSpionResponse") {

            games[result.game].clients.forEach (e => {
                                    
                if(e.clientId == games[result.game].currentSpionSender) {

                    let cardsFromSpion = [];

                    for (let i = 0; i < 7; i++) {
                        if (result.cards[i] == null){
                            cardsFromSpion.push(" Leer");
                        } else {
                            cardsFromSpion.push(" " + cardNameDictionary[result.cards[i]]);
                        }
                    }

                    let payLoad = {
                        "method": "consoleOutput",
                        "message": cardsFromSpion,
                        "color": "#66b300"
                    };
                    //console.log(cardsFromSpion)
                    clients[e.clientId].connection.send(JSON.stringify(payLoad));
                }
            })

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
        //"cards": ["DemoKarte_2", "DemoKarte_3", null, "DemoKarte_-8", "DemoKarte_-10", "DemoKarte_-11", "DemoKarte_-1"],
        "cards": [null, null, null, null, null, null, null],
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

function randomSpecialCard() {
    return Math.floor(Math.random() * (0 - -11)) + -11;



    //NUR THIEFS
    //return -1;

    //NUR SPENDE
    //return -2;

    //NUR HEAL 1
    //return -3;

    //NUR HEAL 2
    //return -5;

    //NUR ERHÖHENHEALTH
    //return -4;

    //NUR REVIVE
    //return -6;

    //NUR SPIONAGE
    //return -7;

    //NUR VORHÄNGESCHLOSS
    //return -8;

    //NUR TAUBHEIT
    //return -9;
}



function SpielerRunde(currentGame) {

    //console.log("Runde begonnen!");
    currentGame.playerAmount = currentGame.clients.length - 1;
    //console.log("Die Spieleranzahl ist " + currentGame.playerAmount);
    currentGame.playeramZug += 1;
    //console.log("Momentan ist Spieler " + currentGame.playeramZug + " dran.")

    if(currentGame.playeramZug > currentGame.playerAmount) {
        currentGame.playeramZug = 0;
        //console.log("Da die maximale Spieleranzahl von " + currentGame.playerAmount + " überschritten wurde, wurde nun der Playerzug auf " + currentGame.playeramZug + " gesetzt.")
    }

    currentGame.clients[currentGame.playeramZug].specialcardState += 1;

    if (currentGame.clients[currentGame.playeramZug].specialcardState == 5) {

        currentGame.clients[currentGame.playeramZug].specialcardState = 0;

        const payLoadZug = {
            "method": "amZug",
            "player": currentGame.clients[currentGame.playeramZug].clientId,
            "getCard": randomCard(),
            "clients": currentGame.clients,
            "specialCard": true,
            "specialCardId": randomSpecialCard()
        }

        currentGame.clients.forEach(c=> {
            clients[c.clientId].connection.send(JSON.stringify(payLoadZug));
        })




    } else {
        const payLoadZug = {
            "method": "amZug",
            "player": currentGame.clients[currentGame.playeramZug].clientId,
            "getCard": randomCard(),
            "clients": currentGame.clients,
            "specialCard": false
        }

        currentGame.clients.forEach(c=> {
            clients[c.clientId].connection.send(JSON.stringify(payLoadZug));
        })

    }


    
    //DRANSEIN-CONSOLE
    let payLoad = {
        "method": "consoleOutput",
        "message": currentGame.clients[currentGame.playeramZug].username + " ist am Zug.",
        "color": "grey"
    };
    currentGame.clients.forEach(c=> {
        if(c.taubheitLeft > 0) {
            c.taubheitLeft -= 1;
        } else {
            clients[c.clientId].connection.send(JSON.stringify(payLoad));
        }
    })

    

    //console.log(currentGame);
    //clients[currentclients[playeramZug].clientId].connection.send(JSON.stringify(payLoadZug));
}


