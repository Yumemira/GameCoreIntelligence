module.exports = {
    searchMethod:function(arenaMeta, id){
        for(let i = 0; i< arenaMeta.length; i++)
        {
            if(!arenaMeta[i].state&&arenaMeta[i].fp.id != id)
            {
                return {state:true, init:arenaMeta[i]}
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
    newInit:function(room, player, names){
        let ret = {
            state:false,
            turn:null,
            roomid:room,
            fp:player,
            fname:names.find(x => x.id == player.id).name,
            fphp:player.hp,
            fnums:null,
            sp:null,
            sphp:null,
            sname:null,
            snums:null,
            glog:[],
            flog:[],
            slog:[]
        }
        return ret
    }
}