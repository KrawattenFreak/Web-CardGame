//IMPORTS--------------------

import { refreshCards } from "./modules/refreshCards.js";

//---------------------------

//DOM ELEMENTS---------------

const consoleOutput = document.getElementById('console');
const divPlayers = document.getElementById("players");
document.getElementById('btnstartGame').addEventListener("click", startGame);
document.getElementById('btnFinishRound').addEventListener("click", finishRound)

const cardDOM = [
    document.getElementById("cardPlace0"),
    document.getElementById("cardPlace1"),
    document.getElementById("cardPlace2"),
    document.getElementById("cardPlace3"),
    document.getElementById("cardPlace4"),
    document.getElementById("cardPlace5"),
    document.getElementById("cardPlace6"),
    document.getElementById("cardPlace7"),
    document.getElementById("cardPlace8")
]

const triggercardDOM = [
    document.getElementById("triggerCard0"),
    document.getElementById("triggerCard1"),
    document.getElementById("triggerCard2"),
    document.getElementById("triggerCard3"),
    document.getElementById("triggerCard4"),
    document.getElementById("triggerCard5"),
    document.getElementById("triggerCard6"),
    document.getElementById("triggerCard7"),
    document.getElementById("triggerCard8")
]


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
let cards = []
let clients = []

let hasSecretID = null;
if(urlParams.has("secretID") == true) {
    hasSecretID = urlParams.get("secretID")
}

let payLoad = {
    "method": "join",
    "username": urlParams.get("username"),
    "gameID": urlParams.get("gameID"),
    "secretID": hasSecretID
}

sendMessage(ws, JSON.stringify(payLoad))

ws.onmessage = message => {
    //message.data 
    const response = JSON.parse(message.data);

    if(response.method === "errorGameAlreadyStarted") {
        console.error("Du dummer Mensch. Die Runde hat schon begonnen.")
    }

    if(response.method === "errorNotYourTurn") {
        console.error("Du bist nicht dran du Wesen.")
    }

    if(response.method === "errorNoGameWithGameID") {
        
        window.location.href = window.location.origin + "?error=" + response.gameID
        console.error("Kein Spiel mit der GameID " + response.gameID + " gefunden.")
    }

    if(response.method === "errorNoUserWithSecretID") {
        window.location.href = window.location.origin + "?errorSID=" + response.secretID
        console.error("Kein User mit der ID " + response.secretID + " gefunden.")
    }

    if(response.method === "errorGameStarted") {
        window.location.href = window.location.origin + "?errorGameStarted=" + true
        console.error("Das Spiel " + response.gameID + " wurde schon gestartet.")
    }

    if(response.method === "errorAnotherSession") {
        window.location.href = window.location.origin + "?errorAnotherSession=" + true
        console.error("Du wurdest ersetzt.")
    }

    if(response.method === "clientJoined") {
        console.log(response.client)

        while(divPlayers.firstChild)
        divPlayers.removeChild(divPlayers.firstChild)

        Object.keys(response.client).forEach (c => {
            console.log(c)
            clients.push(c)

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
        window.history.pushState("", "", '/game?username='+urlParams.get("username")+'&gameID='+ urlParams.get("gameID") +'&secretID='+response.personalID)
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

    if(response.method === "refreshCards") {
        refreshCards(response.cards)
        if(response.isGameStart != true)  {
            CardReset()
        }
        
        //DAS HIER BITTE DORT EINBAUEN WO DIE ZÜGE GEMANAGED WERDEN
        if(response.officialGameStart == true) {
            
            resetPlayerAmZug()

        }

        cards = response.cards
    }

    if(response.method === "playerTurn") {
        resetPlayerAmZug()
        document.getElementById(response.playerPublicID).style.background = "green";
        document.getElementById(response.playerPublicID).style.color = "white";
    }

}

 






//CARD MOVEMENT FUNCTION
let ausgewaelteCard = null;
let targetField = null;
let cardclickstate = 0;
let ausgewaelteCardSelected = false;



cardDOM[0].addEventListener("click", function () {
    if (cardclickstate == 0) {
        ausgewaelteCard = 0;
        CardAngeklickt();
    }
})
cardDOM[1].addEventListener("click", function () {
    if (cardclickstate == 0) {
        ausgewaelteCard = 1;
        CardAngeklickt();
    }
})
cardDOM[2].addEventListener("click", function () {
    if (cardclickstate == 0) {
        ausgewaelteCard = 2;
        CardAngeklickt();
    }
})
cardDOM[3].addEventListener("click", function () {
    if (cardclickstate == 0) {
        ausgewaelteCard = 3;
        CardAngeklickt();
    }
})
cardDOM[4].addEventListener("click", function () {
    if (cardclickstate == 0) {
        ausgewaelteCard = 4;
        CardAngeklickt();
    }
})
cardDOM[5].addEventListener("click", function () {
    if (cardclickstate == 0) {
        ausgewaelteCard = 5;
        CardAngeklickt();
    }
})
cardDOM[6].addEventListener("click", function () {
    if (cardclickstate == 0) {
        ausgewaelteCard = 6;
        CardAngeklickt();
    }
})
cardDOM[7].addEventListener("click", function () {
    if (cardclickstate == 0) {
        ausgewaelteCard = 7;
        CardAngeklickt();
    }
})
cardDOM[8].addEventListener("click", function () {
    if (cardclickstate == 0) {
        ausgewaelteCard = 8;
        CardAngeklickt();
    }
})
triggercardDOM[0].addEventListener("click", function () {
    if (cardclickstate == 1) {
        targetField = 0;
        CardTriedToPlace();
    }
})

triggercardDOM[1].addEventListener("click", function () {
    if (cardclickstate == 1) {
        targetField = 1;
        CardTriedToPlace();
    }
})

triggercardDOM[2].addEventListener("click", function () {
    if (cardclickstate == 1) {
        targetField = 2;
        CardTriedToPlace();
    }
})

triggercardDOM[3].addEventListener("click", function () {
    if (cardclickstate == 1) {
        targetField = 3;
        CardTriedToPlace();
    }
})

triggercardDOM[4].addEventListener("click", function () {
    if (cardclickstate == 1) {    
        targetField = 4;
        CardTriedToPlace();
    }
})

triggercardDOM[5].addEventListener("click", function () {
    if (cardclickstate == 1) {
        targetField = 5;
        CardTriedToPlace();
    }
})

triggercardDOM[6].addEventListener("click", function () {
    if (cardclickstate == 1) {
        targetField = 6;
        CardTriedToPlace();
    }
    })


function CardAngeklickt() {

    if(cards[ausgewaelteCard].CardID != null) {

        CardMoving();

        
    } else {
        console.log("Da ist keine Karte.");
    }
}

function CardMoving() {
    ausgewaelteCardSelected = true;

    document.getElementById('cardPlace' + ausgewaelteCard).style.cursor = "grabbing";
    document.getElementById('cardPlace' + ausgewaelteCard).style.pointerEvents = "none";
    document.getElementById('cardPlace' + ausgewaelteCard).style.zIndex = "100";


    document.addEventListener('mousemove', function(ev){
    
        //ÜBERGANGSLÖSUNG
        if(ausgewaelteCardSelected == true) {
            
            document.getElementById('cardPlace' + ausgewaelteCard).style.top = ev.clientY - 105 +  "px";
            document.getElementById('cardPlace' + ausgewaelteCard).style.left = ev.clientX - 70 + "px";
            //ÜBERGANGSLÖSUNG
            cardclickstate = 1;
        }
    
    });
}

function CardTriedToPlace() {
    let payLoad = {
        "method": "cardMove",
        "ausgewaehlteCard": ausgewaelteCard,
        "targetCard": targetField
    }

    sendMessage(ws, JSON.stringify(payLoad))
}

function CardReset() {
    ausgewaelteCardSelected = false;
    document.getElementById('cardPlace' + ausgewaelteCard).style.zIndex = "1";
    document.getElementById('cardPlace' + ausgewaelteCard).style.removeProperty('left');
    document.getElementById('cardPlace' + ausgewaelteCard).style.removeProperty('top');
    document.getElementById('cardPlace' + ausgewaelteCard).style.pointerEvents = "all";
    cardclickstate = 0;

}

function startGame() {
    let payLoad = {
        "method": "startGame"
    }
    sendMessage(ws, JSON.stringify(payLoad))
}

function finishRound() {
    let payLoad = {
        "method": "finishRound"
    }
    sendMessage(ws, JSON.stringify(payLoad))
}


function resetPlayerAmZug() {
    clients.forEach(c => {
        document.getElementById(c).style.background = "blue";
        document.getElementById(c).style.color = "white";
    })
}