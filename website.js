const express = require("express");
const app = express()
app.use(express.static('public'))
app.get("/", (req, res) => {
    res.sendFile(__dirname + "/public/templates/index.html")
})

app.get("/game", (req, res) => {
    res.sendFile(__dirname + "/public/templates/game.html")
})
app.listen(process.env.PORT || 9091, () => console.log("HTML-SERVE-SERVER STARTED ON HTTP PORT 9091!"))