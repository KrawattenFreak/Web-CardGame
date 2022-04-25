
const res = require("express/lib/response");
const { redirect } = require("express/lib/response");
const http = require("http");
const { connection } = require("websocket");

const websocketServer = require("websocket").server
const httpServer = http.createServer();
const port = process.env.PORT || 9090;

//
httpServer.listen(port, () => console.log("WEBSOCKET GESTARTET AUF PORT " + port))


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

        if (result.method === "create") {
            const gameID = generateID(5);
            games[gameID] = {
                "gameID": gameID,
                "clients": {}
            }

            console.log(games)


        }

        if (result.method === "join") {

        
        }
    })

})




//ID GENERATOR FUNCTION
const characters ='ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
function generateID(length) {
    let result = '';
    const charactersLength = characters.length;
    for ( let i = 0; i < length; i++ ) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}
//-------------------------