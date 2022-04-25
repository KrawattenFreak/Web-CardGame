const res = require("express/lib/response");
const express = require("express");
const app = express()
app.use(express.static('public'))
app.get("/", (req, res) => {
    res.sendFile(__dirname + "/public/indexOLD.html")
    console.log(res);

})
app.listen(process.env.PORT || 9091, () => console.log("Listening on http port 9091"))