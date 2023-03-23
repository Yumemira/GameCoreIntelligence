require('dotenv').config()
const http = require('http')
const express = require("express")
const cors = require('cors')
const tools = require('./playtools/tools')
const { Server } = require("socket.io")

const hostname = process.env.DEFAULT_HOST
const app = express()
const port = process.env.DEFAULT_PORT

console.log(process.env.REACT_FRONT_PATH)
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
    const inst = gameMeta.find(x => x.playerId === req.body.pid)
    if(!inst){
        const gameInstance = {
            playerId:req.body.pid,
            playerNum:null,
            globalLog:[],
            generatedNum:tools.generateRandomNum(),
            starting:tools.randomMessage(),
            log:[],
            weights:tools.generateWeights(),
            reserve:[],
            found:0,
            stage:1
        }
        gameMeta.push(gameInstance)
        res.json({start:gameInstance.starting,num:gameInstance.playerNum})
    }
    else
    {
        res.json({start:inst.starting, message:inst.log,num:inst.playerNum})
    }
})

app.post('/crowscare-set-number',function(req,res){
    let elem = gameMeta.find(x => x.playerId === req.body.pid)
    gameMeta[gameMeta.indexOf(elem)].playerNum = req.body.setting
    res.json({message:'success'})
})

app.post('/crowscare-game-suggestion', function(req,res){
    const suggest = req.body.suggest
    const searched = gameMeta.find(x => x.playerId === req.body.pid)
    const ans = tools.answerCompare(suggest,searched.generatedNum.join(''))
    const index = gameMeta.indexOf(searched)
    gameMeta[index].globalLog.push({nums:suggest, ans:ans})
    const cans = tools.createAnswer(searched.playerNum, searched.weights, searched.stage, searched.found, searched.reserve, searched.log)
    
    gameMeta[index].reserve = cans.reserve
    gameMeta[index].weights = cans.weights
    gameMeta[index].stage = cans.stage
    gameMeta[index].found = cans.found
    gameMeta[index].log = cans.log


    if(ans[0]===4)
    {
        res.json({state:"win"})
    }
    else if(cans.log.ans[0] === 4)
    {
        res.json({state:"lose"})
    }

    res.json({message:ans, })
})

app.post('/crowscare-end-game', function(req,res){
    gameMeta.splice(gameMeta.indexOf(gameMeta.find(x => x.playerId === req.body.pid)), 1)
    res.json({message:'success'})
})


server.listen(port, hostname, () => {console.log('starting')})