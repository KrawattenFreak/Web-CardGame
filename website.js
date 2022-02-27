const res = require("express/lib/response");
const express = require("express");
const app = express()
app.use(express.static('public'))
app.get("/", (req, res) => {
    res.sendFile(__dirname + "/public/index.html")
    console.log(res);

})
app.listen(9091, () => console.log("Listening on http port 9091"))