module.exports = {
    searchMethod:function(arenaMeta, id){
        for(let i = 0; i< arenaMeta.length; i++)
        {
            if(!arenaMeta[i].state&&arenaMeta[i].fp.id != id)
            {
                console.log("found")
                return {state:true, init:data}
            }
        }

        return {state:false, init:null}
    },

    generateRoom:function(arenaMeta){
        let r = Math.floor(Math.random()*1000000)
        if(arenaMeta.find(x => x.roomid== r))
        {
            return this.generateRoom(arenaMeta)
        }
        return r
    },
    newInit:function(room, player){
        let ret = {
            state:false,
            roomid:room,
            fp:player,
            fphp:player.hp,
            sp:null,
            sphp:null,
            glog:[],
            flog:[],
            slog:[]
        }
        return ret
    }
}