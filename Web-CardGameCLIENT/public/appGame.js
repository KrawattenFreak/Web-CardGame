//IMPORTS--------------------



//---------------------------

//DOM ELEMENTS---------------

const consoleOutput = document.getElementById('console');
const divPlayers = document.getElementById("players");
document.getElementById('btnstartGame').addEventListener("click", startGame);




//---------------------------





//CODE TO PREVENT ATTEMPS SENDING MESSAGES TO A CLOSED WEBSOCKET  -> .sendMessage()
let ws = new WebSocket("ws://localhost:9090")
const waitForOpenConnection = (socket) => {
    return new Promise((resolve, reject) => {
        const maxNumberOfAttempts = 10
        const intervalTime = 200 //ms

        let currentAttempt = 0
        const interval = setInterval(() => {
            if (currentAttempt > maxNumberOfAttempts - 1) {
                clearInterval(interval)
                reject(new Error('Maximum number of attempts exceeded'))
            } else if (socket.readyState === socket.OPEN) {
                clearInterval(interval)
                resolve()
            }
            currentAttempt++
        }, intervalTime)
    })
}
const sendMessage = async (socket, msg) => {
    if (socket.readyState !== socket.OPEN) {
        try {
            await waitForOpenConnection(socket)
            socket.send(msg)
        } catch (err) { console.error(err) }
    } else {
        socket.send(msg)
    }
}


//URL PARAMETER MANAGEMENT
const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);

if (urlParams.has("username") == true && urlParams.has("gameID") == true) {

} else {
    console.error("Du hast keine Ahnung von der URL. Bitte nix verändern ok?")
}


//START---------------------------------------------------------------------------

let payLoad = {
    "method": "join",
    "username": urlParams.get("username"),
    "gameID": urlParams.get("gameID")
}

sendMessage(ws, JSON.stringify(payLoad))

ws.onmessage = message => {
    //message.data 
    const response = JSON.parse(message.data);

    if(response.method === "errorNoGameWithGameID") {
        
        window.location.href = window.location.origin + "?error=" + response.gameID
        console.error("Kein Spiel mit der GameID " + response.gameID + " gefunden.")
    }

    if(response.method === "clientJoined") {
        console.log(response.client)

        while(divPlayers.firstChild)
        divPlayers.removeChild(divPlayers.firstChild)

        Object.keys(response.client).forEach (c => {

        
            console.log(c)

            //building a Child inside of Playerlist
            const d = document.createElement("div");
            d.style.width = "200px";
            d.setAttribute("id", c);
            d.setAttribute("class", "oneplayer");

            const t = document.createElement("p");
            t.textContent = response.client[c];
            d.appendChild(t);
            
            //c.divCard = d;
            divPlayers.appendChild(d);
            
            const p = document.createElement("progress");
            d.appendChild(p);
            p.setAttribute("id", c+"progress");

        })


    }

    if(response.method === "getYourPersonalSickID") {
        console.log("Your personal ID is: " + response.personalID + ".")
    }
    
    if(response.method === "consoleOutput") {
        const scrollToBottom = (node) => {
            node.scrollTop = node.scrollHeight;
        }

        const p = document.createElement("p");
        p.textContent = response.message;
        p.style.color = response.color;
        consoleOutput.appendChild(p);

        scrollToBottom(consoleOutput);
    }
}


let cards = [];

function startGame() {
    let payLoad = {
        "method": "startGame"
    }
    sendMessage(ws, JSON.stringify(payLoad))
}
