require('dotenv').config()
const http = require('http')
const express = require("express")
const cors = require('cors')
const tools = require('./playtools/tools')
const arenaTools = require('./playtools/arenaTools')
const serverTools = require('./playtools/serverTools')
const { Server } = require("socket.io")

const hostname = process.env.DEFAULT_HOST
const app = express()
const port = process.env.DEFAULT_PORT

app.use(express.urlencoded())
app.use(cors({origin: process.env.REACT_FRONT_PATH}))
app.use(express.json())

var gameMeta = []
var arenaMeta = []
var playerstats = []
var nicknames = []

const server = http.createServer(app)
const io = new Server(server, {
    cors: {
      origin:process.env.REACT_FRONT_PATH,
      methods: ['GET', 'POST']
    },
})

io.on("connection",(socket) => {
  socket.on("start_game", (data) => {
    const {user, room} = data
    socket.join(room)
    
    i = arenaMeta.indexOf(arenaMeta.find(x => x.roomid == room))
    arenaMeta[i].state = true
    arenaMeta[i].sp = playerstats.find(x => x.id === user)
    arenaMeta[i].sname = nicknames.find(x => x.id == user).name
    arenaMeta[i].sphp = arenaMeta[i].sp.hp

    console.log(`game has been started by ${user}`)
    io.to(room).emit("start")
  })

  socket.on("search_game", (data) => {
    const {user, room} = data
    console.log(`user ${user} starts searching`)
    socket.join(room)
    console.log(arenaMeta)
  })

  socket.on("end-game", (data) => {
    const {room} = data

    arenaMeta.splice(arenaMeta.indexOf(arenaMeta.find(x => x.roomid == room)), 1)
    socket.leave(room)
  })
  
  socket.on("leave_searching", (data) => {
    const {room} = data
    arenaMeta.splice(arenaMeta.indexOf(arenaMeta.find(x => x.roomid == room)), 1)
    socket.leave(room)
    io.to(room).emit("cancel--game")
    console.log(`room ${room} has been deleted`)
  })

  socket.on("prepared", data => {
    const {room} = data
    io.to(room).emit("opponent-ready")
  })

  socket.on("number_attached", data => {
    const {nums, user, room} = data
    const i = arenaMeta.findIndex(x => x.roomid == room)

    if(arenaMeta[i].fp.id == user)
    {
      arenaMeta[i].fnums = nums
      io.to(room).emit("message", {name:arenaMeta[i].fname, text:"Подтверждаю готовность в дуэли"})
    }
    else
    {
      arenaMeta[i].snums = nums
      
      io.to(room).emit("message", {name:arenaMeta[i].sname, text:"Подтверждаю готовность в дуэли"})
    }
    if(arenaMeta[i].fnums&&arenaMeta[i].snums)
    {
      if(Math.floor(Math.random()*2)<1)
      {
        arenaMeta[i].turn = arenaMeta[i].fp.id
      }
      else
      {
        arenaMeta[i].turn = arenaMeta[i].sp.id
      }
    }
  })

  socket.on("number_suggest", data => {
    const {place, user, room, suggest} = data
    let i = arenaMeta.findIndex(x => x.roomid == room)
    let won = false
    if(arenaMeta[i].turn == user)
    {
      if(place == 0)
      {
        const ans = tools.answerCompare(suggest, arenaMeta[i].snums)
        arenaMeta[i].glog.push({author:arenaMeta[i].fname, dmg:ans[0]*3 + ans[1]})
        arenaMeta[i].flog.push({nums:suggest,ans:ans})
        arenaMeta[i].sphp -= ans[0]*3 + ans[1]
        arenaMeta[i].turn = arenaMeta[i].sp.id

        if(arenaMeta[i].sphp <= 0||ans[0]==4)
        {
          won = true
        }

        io.to(room).emit("suggested", {user:user, glog:arenaMeta[i].glog[arenaMeta[i].glog.length-1], log:arenaMeta[i].flog[arenaMeta[i].flog.length-1], hp:arenaMeta[i].sphp, won:won})
      }
      else
      {
        const ans = tools.answerCompare(suggest, arenaMeta[i].fnums)
        arenaMeta[i].glog.push({author:arenaMeta[i].sname, dmg:ans[0]*3 + ans[1]})
        arenaMeta[i].slog.push({nums:suggest,ans:ans})
        arenaMeta[i].fphp -= ans[0]*3 + ans[1]
        arenaMeta[i].turn = arenaMeta[i].fp.id

        if(arenaMeta[i].fphp <= 0||ans[0]==4)
        {
          won = true
        }


        io.to(room).emit("suggested", {user:user, glog:arenaMeta[i].glog[arenaMeta[i].glog.length-1], log:arenaMeta[i].slog[arenaMeta[i].slog.length-1], hp:arenaMeta[i].fphp, won:won})
      }
    }
    
  })
})


app.post('/crowscare-game-start', function(req, res){
    const inst = gameMeta.find(x => x.playerId === req.body.pid)
    if(!inst){
        const gameInstance = {
            crowhp:50,
            pname:req.body.pname,
            playerhp:playerstats.find(x => x.id === req.body.pid).hp,
            playerId:req.body.pid,
            pstr:playerstats.find(x => x.id === req.body.pid).strength,
            playerNum:null,
            globalLog:[],
            generatedNum:tools.generateRandomNum(),
            starting:tools.randomMessage(),
            log:[],
            plog:[],
            weights:tools.generateWeights(),
            reserve:[],
            found:0,
            stage:1
        }
        gameMeta.push(gameInstance)
        res.json({num:gameInstance.playerNum})
    }
    else
    {
        res.json({log:inst.log, plog:inst.plog, glog:inst.globalLog, num:inst.playerNum, php:inst.playerhp, shp:inst.crowhp})
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
    const ans = tools.answerCompare(suggest, searched.generatedNum.join(''))
    const index = gameMeta.indexOf(searched)
    const cans = tools.createAnswer(searched.playerNum, searched.weights, searched.stage, searched.found, searched.reserve, searched.log)
    
    gameMeta[index].log = cans.log
    gameMeta[index].plog.push({nums:suggest, ans:ans})
    gameMeta[index].globalLog.push({author:gameMeta[index].pname, dmg:ans[0]*gameMeta[index].pstr + ans[1]})
    gameMeta[index].globalLog.push({author:'Пугало', dmg:cans.log[cans.log.length-1].ans[0]*3 + cans.log[cans.log.length-1].ans[1]})

    gameMeta[index].crowhp -= ans[0]*3 + ans[1]
    gameMeta[index].playerhp -= cans.log[cans.log.length-1].ans[0]*3 + cans.log[cans.log.length-1].ans[1]
    gameMeta[index].reserve = cans.reserve
    gameMeta[index].weights = cans.weights
    gameMeta[index].stage = cans.stage
    gameMeta[index].found = cans.found

    if(cans.log[cans.log.length-1].ans[0] == 4)
    {
      gameMeta[index].playerhp = 0
    }
    if(ans[0]==4)
    {
      gameMeta[index].crowhp = 0
    }
    if(gameMeta[index].crowhp <= 0 && gameMeta[index].playerhp <= 0)
    {
        const tmp = gameMeta.splice(index, 1)[0]
        res.json({state:"Ничья", glogs:[tmp.globalLog[tmp.globalLog.length - 2],tmp.globalLog[tmp.globalLog.length - 1]], plog:tmp.plog[tmp.plog.length - 1], log:tmp.log[tmp.log.length - 1]})
    }
    else if(gameMeta[index].crowhp <= 0)
    {
        const tmp = gameMeta.splice(index, 1)[0]
        res.json({state:"Победа", glogs:[tmp.globalLog[tmp.globalLog.length - 2],tmp.globalLog[tmp.globalLog.length - 1]], plog:tmp.plog[tmp.plog.length - 1], log:tmp.log[tmp.log.length - 1]})
    }
    else if(gameMeta[index].playerhp <= 0)
    {
        const tmp = gameMeta.splice(index, 1)[0]

        res.json({state:"Поражение", glogs:[tmp.globalLog[tmp.globalLog.length - 2],tmp.globalLog[tmp.globalLog.length - 1]], plog:tmp.plog[tmp.plog.length - 1], log:tmp.log[tmp.log.length - 1]})
    }
    else
    {
        res.json({glogs:[gameMeta[index].globalLog[gameMeta[index].globalLog.length - 2],gameMeta[index].globalLog[gameMeta[index].globalLog.length - 1]], plog:gameMeta[index].plog[gameMeta[index].plog.length - 1], log:gameMeta[index].log[gameMeta[index].log.length - 1], php:gameMeta[index].playerhp, shp:gameMeta[index].crowhp})
    }
})
app.post('/crowscare-end-game', function(req,res){
    gameMeta.splice(gameMeta.indexOf(gameMeta.find(x => x.playerId === req.body.pid)), 1)
    res.json({message:'success'})
})



app.post('/pvp-game-preparation', function(req, res){
  const { userid } = req.body
  const {state, init} = arenaTools.searchMethod(arenaMeta, userid)
  console.log(init)
  let i = null
  if(state)
  {
    i = arenaMeta.indexOf(init)
    res.json({state:state, room:arenaMeta[i].roomid})
  }
  else
  {
    let a = arenaMeta.find(x => x.fp.id == userid)
    if(!a)
    {
      i = arenaMeta.indexOf(a)

      if(i == -1) i = arenaMeta.push(arenaTools.newInit(arenaTools.generateRoom(arenaMeta), playerstats.find(x => x.id == userid), nicknames)) - 1
      res.json({state:false, room:arenaMeta[i].roomid})
    }
    else
    {

      res.json({state:false, room:a.roomid})
    }
  }
})

app.post("/pvp-game-loadstats", function(req, res){
  const {id, room} = req.body
  const init = arenaMeta.find(x => x.roomid == room)
  let uid = 0
  if(init.fp.id != id)
  {
    uid = 1
  
    res.json({hp:init.sphp, place:uid, shp:init.fphp, name:init.fname})
  }
  else
  {
    res.json({hp:init.fphp, place:uid, shp:init.sphp, name:init.sname})
  }
})





app.post("/register",function(req, res){
    const uname = req.body.uname
    const umail = req.body.umail
    const upass = req.body.upassword
  
    serverTools.queryToDbMain("select email from userstable where email = $1 limit 1", [umail])
    .then((ret) => {
      if(ret.length === 0)
      {
        const unicKey = serverTools.unicNumGenerator();
  
        serverTools.queryToDbMain(`
        INSERT INTO userstable (name, email, password, loginkey, state, guild)
        VALUES ($1,$2,$3,$4, 'o', -1);`, [uname, umail, upass, unicKey])
        .then(() => {
          serverTools.queryToDbMain(`select id from userstable where email = $1 limit 1`,[umail])
          .then(uret => {
            serverTools.queryToDb(`insert into "hpBackups" (id, maxhp, maxep, vitality, strength, agility, intelligency) values ($1,50, 50, 1, 1, 1, 1)`,[uret[0].id])
            playerstats.push({id:uret[0].id, hp:50, ep:50, maxhp:50, maxep:50, vitality:1, strength:1, agility:1, intelligency:1})
            nicknames.push({id:uret[0].id, name:uname})
            res.json({message: "Успешная регистрация", lkey: unicKey, success: true, uid: uret[0].id})
          });
        })
      }
      else
      {
        res.json({message: "Эта почта уже занята", success: false});
      }
    });
  });

app.post("/login",function(req, res){
    const umail = req.body.umail;
    const upass = req.body.upassword;
  
    serverTools.queryToDbMain(`select id, password, loginkey, name from userstable where email = $1 limit 1`, [umail])
    .then((ret) => {
      if(ret.length === 0||ret[0].password !== upass)
      {
        res.json({message: "Невереный логин или пароль"});
      }
      else
      {
        serverTools.queryToDb('select id from "Player" where id=$1 limit 1',[ret[0].id])
        .then(rety => {
          if(rety.length===0)
          {
            serverTools.queryToDb(`insert into "hpBackups" (id, maxhp, maxep, vitality, strength, agility, intelligency) values ($1,50, 50, 1, 1, 1, 1)`,[ret[0].id])
            playerstats.push({id:ret[0].id, hp:50, ep:50, maxhp:50, maxep:50, vitality:1, strength:1, agility:1, intelligency:1})
            nicknames.push({id:ret[0].id, name:ret[0].name})
          }
        })
          res.json({uid: ret[0].id, name: ret[0].name, message: "Успешный вход", state:true, lkey: ret[0].loginkey});
      }
    });
  });

app.post('/p-stat', function(req,res){
  res.json({nickname:nicknames.find(x => x.id === req.body.id).name, hp:playerstats.find(x => x.id === req.body.id).hp, ep:playerstats.find(x => x.id === req.body.id).ep})
});


server.listen(port, hostname, () => {
    
    serverTools.queryToDb('SELECT * FROM "hpBackups"')
    .then(ret => {
        if(ret.length>0) {
          for( let i = 0; i < ret.length; i++)
          {
            playerstats.push({id:ret[i].id, hp:ret[i].maxhp, ep:ret[i].maxep, maxhp:ret[i].maxhp, maxep:ret[i].maxep, vitality:ret[i].vitality, strength:ret[i].strength, agility:ret[i].agility, intelligency:ret[i].intelligency})
          }
        }
      })

    serverTools.queryToDbMain('SELECT id, name FROM "userstable"')
    .then(ret => {
      if(ret.length>0) {
          nicknames = ret
      }
    })

    setInterval(() => {
        for(let heali = 0; heali < playerstats.length; heali++)
        {
            if(playerstats[heali].hp < playerstats[heali].maxhp)
            {
                playerstats[heali].hp += playerstats[heali].hpregen
                if(playerstats[heali].hp > playerstats[heali].maxhp) playerstats[heali].hp = playerstats[heali].maxhp
            }
            if(playerstats[heali].mp < playerstats[heali].maxmp)
            {
                playerstats[heali].mp += playerstats[heali].mpregen
                if(playerstats[heali].mp > playerstats[heali].maxmp) playerstats[heali].mp = playerstats[heali].maxmp
            }
        }
    }, 60000);
})