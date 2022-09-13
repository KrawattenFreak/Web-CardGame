//IMPORTS--------------------



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

if (urlParams.has("username") == true && urlParams.has("userID") == true) {

} else {
    console.error("Du URL MANIPULATOR")
}


//START---------------------------------------------------------------------------

let payLoad = {
    "method": "test",
    "username": urlParams.get("username"),
    "userID": urlParams.get("userID")
}

sendMessage(ws, JSON.stringify(payLoad))



let cards = [];







