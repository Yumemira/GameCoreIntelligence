require('dotenv').config()
const http = require('http')
const express = require("express")
const cors = require('cors')
const tools = require('./playtools/tools')

const hostname = process.env.DEFAULT_HOST
const app = express()
const port = process.env.DEFAULT_PORT

app.use(express.urlencoded())
app.use(cors({origin: process.env.REACT_FRONT_PATH}))
app.use(express.json())

var gameMeta = []

const server = http.createServer(app)
const io = new Server(server, {
    cors: {
      origin:process.env.FRONT_PATH,
      methods: ['GET', 'POST']
    },
})


app.post('/crowscare-game-start', function(req,res){
    var gameInstance = {
        playerId:req.body.pid,
        log:[],
        weights:tools.generateWeights()
    }

    gameMeta.push(gameInstance)
})



server.listen(port, hostname, () => {console.log('starting')})