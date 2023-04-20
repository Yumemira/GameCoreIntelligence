module.exports = {
    generateWeights:function(){
        let gen = []
        for(let i = 0; i<10; i++)
        {
            gen.push({num:i,weight:[-1,0.25,0.25,0.25,0.25]})
        }

//refreshing

        for(let i=0; i<10; i++)
        {
            const rand = Math.floor(Math.random()*9)
            const temp = gen[i]
            gen[i] = gen[rand]
            gen[rand] = temp
        }
        return gen
    },
    generateRandomNum:function(){
        let gen = []
        while(gen.length<4)
        {
            let piece = Math.floor(Math.random()*10)%10

            if(gen.indexOf(piece)===-1)
            {
              gen.push(piece)
            }
        }
        return gen
    },
    randomMessage:function(){
        switch(Math.floor(Math.random()*5))
        {
            case 0:
                return [{author:"Пугало",msg:"Активация систем модуляции"}, {author:"Пугало",msg:"Создание устрашающего вида"}, {author:"Пугало",msg:"Загрузка главных модулей"}, {author:"Пугало",msg:"Ошибка, перезагрузка..."}, {author:"Пугало",msg:"Боевой мод активирован!"}]
            case 1:
                return [{author:"Пугало",msg:"Поиск прототипа"}, {author:"Пугало",msg:"Активация боевого снаряжения"}, {author:"Пугало",msg:"Обновление windows..."}]
            case 2:
                return [{author:"Пугало",msg:"Объект испытаний обнаружен"}, {author:"Пугало",msg:"Настройка среды обработки"}, {author:"Пугало",msg:"Модуляция исходов сражения..."}]
            case 3:
                return [{author:"Пугало",msg:"Поиск решения задачи равенства классов P и NP"},{author:"Пугало",msg:"Ошибка! Перезапуск..."},{author:"Пугало",msg:"Обнаружен противник"}, {author:"Пугало",msg:"Активация боевого режима"}]
            default:
                return [{author:"Пугало",msg:"Активация промежуточного состояния"},{author:"Пугало",msg:"Поиск неисправных модулей"},{author:"Пугало",msg:"Ошибка, код поиска неисправен!"},{author:"Пугало",msg:"Попытка переподключения успешна..."}]
            
        }
    },
    answerCompare:function(ans, check){
        let ret = [0, 0]
        for(let i = 0; i < 4; i++)
        {
            let checkin = check.indexOf(ans[i])
            if(checkin===i)
            {
                ret[0]+=1
            }
            else if(checkin!==-1){
                ret[1]+=1
            }
        }
        return ret
    },
    createAnswer:function(comparison, weights, stage, found, reserve, log)
    {
        console.log(`step is: ${stage}`)
        let coll = []
        let answer
        let unfound
        let empty
        let indexes = []
        switch(stage)
        {
            case 1:
                for(let i = 0;i < 4; i++)
                {
                    coll.push(weights[i].num)
                }

                answer = this.answerCompare(coll, comparison)
                log.push({num:coll, ans:answer})
                found = answer[0] + answer[1]

                for(let i = 0;i < 4; i++)
                {
                    weights[i].weight[0] = found/4
                    weights[i].weight[i+1] = answer[0]/(answer[0]+answer[1])
                }
                if(found === 4)
                {
                    reserve = []
                    reserve.push({nums:[coll[0],coll[1]],weight:1})
                    reserve.push({nums:[coll[2],coll[3]],weight:1})
                    stage = 7
                }
                else
                {
                    stage = 2
                }

                return {weights:weights, reserve:reserve, stage:stage, found:found, log:log}
            case 2:
                for(let i = 4;i < 8; i++)
                {
                    coll.push(weights[i].num)
                }

                answer = this.answerCompare(coll, comparison)
                log.push({num:coll, ans:answer})
                if(answer[0]+answer[1]===4)
                {
                    reserve.push({nums:[coll[0],coll[1]],weight:1})
                    reserve.push({nums:[coll[2],coll[3]],weight:1})
                    stage = 7
                }
                else
                {
                    found += answer[0] + answer[1]
                    unfound = (4-found)/2
                    reserve.push({nums:[weights[8].num, weights[9].num], weight:unfound})
                    weights[8].weight[0] = unfound
                    weights[9].weight[0] = unfound

                    for(let i = 4;i < 8; i++)
                    {
                        weights[i].weight[0] = (answer[0] + answer[1])/4
                        weights[i].weight[i-3] = answer[0]/(answer[0]+answer[1])
                    }
                    stage +=1
                }
                return {weights:weights,reserve:reserve,stage:stage,found:found,log:log}
            case 3:
                if(log[0].ans[0]+log[0].ans[1]>0)
                {
                    coll.push(weights[0].num)
                    coll.push(weights[1].num)
                    coll.push(reserve[0].nums[0])
                    coll.push(reserve[0].nums[1])

                    answer = this.answerCompare(coll, comparison)
                    log.push({num:coll, ans:answer})
                    reserve.push({nums:[weights[0].num, weights[1].num], weight:(answer[0]+answer[1])/2-reserve[0].weight})
                    reserve.push({nums:[weights[2].num, weights[3].num], weight:((log[0].ans[0]+log[0].ans[1])/2-(answer[0]+answer[1])/2+reserve[0].weight)})
                }
                else
                {
                    reserve.push({nums:[weights[0].num, weights[1].num], weight:0})
                    reserve.push({nums:[weights[2].num, weights[3].num], weight:0})
                    return this.createAnswer(comparison, weights, stage+1, found, reserve, log)
                }

                return {weights:weights,reserve:reserve,stage:stage+1,found:found,log:log}
            case 4:
                if(log[1].ans[0]+log[1].ans[1]>0)
                {
                    coll.push(weights[4].num)
                    coll.push(weights[5].num)

                    coll.push(reserve[0].nums[0])
                    coll.push(reserve[0].nums[1])

                    answer = this.answerCompare(coll, comparison)
                    log.push({num:coll, ans:answer})
                    reserve.push({nums:[weights[4].num, weights[5].num], weight:(answer[0]+answer[1])/2-reserve[0].weight})
                    
                    unfound = 2
                    for(let i = 0; i<reserve.length;i++)
                    {
                        unfound -= reserve[i].weight
                    }
                    reserve.push({nums:[weights[6].num, weights[7].num], weight:unfound})
                }
                else
                {
                    reserve.push({nums:[weights[4].num, weights[5].num], weight:0})
                    reserve.push({nums:[weights[6].num, weights[7].num], weight:0})
                    return this.createAnswer(comparison, weights, stage+1, found, reserve, log)
                }
                
            
                return {weights:weights,reserve:reserve,stage:stage+1,found:found,log:log}
            case 5:
                for(let i = 0; i< reserve.length;i++)
                {
                    if(reserve[i].weight == 0.5)
                    {
                        coll.push(reserve[i].nums[0])
                        indexes.push(i)
                    }
                    if(coll.length===2) break
                }
                if(indexes.length === 0)
                {
                    return this.createAnswer(comparison, weights, 7, found, reserve, log)
                }
                empty = reserve.find(x => x.weight === 0)
                coll.push(empty.nums[0])
                coll.push(empty.nums[1])
                answer = this.answerCompare(coll, comparison)
                log.push({num:coll, ans:answer})
                

                if(answer[0] + answer[1] === 2)
                {
                    reserve.push({nums:[coll[0], coll[1]], weight:1})
                    
                    reserve.splice(indexes[1], 1)
                    reserve.splice(indexes[0], 1)
                    stage += 2
                }
                else if(answer[0] + answer[1] === 0)
                {
                    reserve.push({nums:[reserve[indexes[0]].nums[1], reserve[indexes[1]].nums[1]], weight:1})

                    reserve.splice(indexes[1], 1)
                    reserve.splice(indexes[0], 1)
                    stage += 2
                }
                else
                {
                    stage += 1
                }
                return {weights:weights,reserve:reserve,stage:stage,found:found,log:log}
            case 6:
                for(let i = 0; i < reserve.length; i++)
                {
                    if(reserve[i].weight == 0.5)
                    {
                        coll.push(reserve[i].nums[0+coll.length])
                        indexes.push(i)
                    }
                    if(coll.length==2) break
                }
                empty = reserve.find(x => x.weight === 0)
                coll.push(empty.nums[0])
                coll.push(empty.nums[1])
                answer = this.answerCompare(coll, comparison)
                log.push({num:coll, ans:answer})

                if(answer[0] + answer[1] === 2)
                {
                    reserve.push({nums:[coll[0], coll[1]], weight:1})
                    reserve.splice(indexes[1], 1)
                    reserve.splice(indexes[0], 1)
                }
                else if(answer[0] + answer[1] === 0)
                {
                    reserve.push({nums:[reserve[indexes[0]].nums[1], reserve[indexes[1]].nums[0]], weight:1})
                    reserve.splice(indexes[1], 1)
                    reserve.splice(indexes[0], 1)
                }

                return {weights:weights,reserve:reserve,stage:stage+1,found:found,log:log}
            case 7:
                if(reserve.find(x => x.weight === 0.5))
                {
                    return this.createAnswer(comparison, weights, 5, found, reserve, log)
                }
                for(let i = 0; i < reserve.length; i++)
                {
                    if(reserve[i].weight === 1)
                    {
                        weights[weights.indexOf(weights.find(x => x.num === reserve[i].nums[0]))].weight[0] = 1
                        weights[weights.indexOf(weights.find(x => x.num === reserve[i].nums[1]))].weight[0] = 1
                        indexes.push({el:weights[weights.indexOf(weights.find(x => x.num === reserve[i].nums[0]))], captured:false})
                        indexes.push({el:weights[weights.indexOf(weights.find(x => x.num === reserve[i].nums[1]))], captured:false})
                    }
                }
                weights = indexes
                found = 0
                for(let i = 0; i< 4;i++)
                {
                    let newIndex = weights.find(x => x.el.weight[i+1]===1)
                    if(newIndex)
                    {
                        weights = this.swapElems(weights, [i, weights.indexOf(newIndex)])
                        weights[i].captured = true
                        found++
                    }
                }

                for(let i = 0; i< 4;i++)
                {
                    coll.push(weights[i].el.num)
                }

                answer = this.answerCompare(coll, comparison)
                log.push({num:coll, ans:answer})
                
                if(answer[0]===found)
                {
                    for(let i = 0; i< 4;i++)
                    {
                        if(!weights[i].captured) weights[i].el.weight[i+1] = 0
                    }
                }
                found = answer[0]

                return {weights:weights,reserve:reserve,stage:stage+1,found:found,log:log}
            case 8:
                let a = 0
                while(indexes.length<1)
                {
                    if(!weights[a].captured)
                    {
                        indexes.push(a)
                    }
                    a++
                }

                while(indexes.length<2)
                {
                    if(a>3)
                    {
                        weights[indexes[0]].el.weight[indexes[0]+1] = 1
                        weights[indexes[0]].captured = true
                        found++
                        
                        return this.createAnswer(comparison, weights, stage, found, reserve, log)
                    }
                    if(!weights[a].captured&&weights[a].el.weight[indexes[0]+1]!==0&&weights[indexes[0]].el.weight[a+1]!==0)
                    {
                        indexes.push(a)
                    }
                    a++
                }


                weights = this.swapElems(weights, indexes)
                
                for(let i = 0; i < 4; i++)
                {
                    coll.push(weights[i].el.num)
                }

                answer = this.answerCompare(coll, comparison)
                log.push({num:coll, ans:answer})
                switch(answer[0]-found)
                {
                    case 1:
                        stage++
                        break
                    case 2:
                        weights[indexes[0]].el.weight[indexes[0]+1] = 1
                        weights[indexes[1]].el.weight[indexes[1]+1] = 1
                        weights[indexes[0]].captured = true
                        weights[indexes[1]].captured = true
                        found+=2
                        break
                    case -1:
                        stage = 10
                        break
                    case -2:
                        weights = this.swapElems(weights, indexes)
                        weights[indexes[0]].el.weight[indexes[0]+1] = 1
                        weights[indexes[1]].el.weight[indexes[1]+1] = 1
                        weights[indexes[0]].captured = true
                        weights[indexes[1]].captured = true
                        found +=2
                        break
                    default:
                        weights[indexes[0]].el.weight[indexes[0]+1] = 0
                        weights[indexes[1]].el.weight[indexes[1]+1] = 0
                        break
                }

                reserve = indexes
                return {weights:weights,reserve:reserve,stage:stage,found:found,log:log}
            case 9:
                for(let i = 0; i<4;i++)
                {
                    coll.push(weights[i].el.num)
                }
                
                for(let i = 0; i<10;i++)
                {
                    if(!weights.find(x => x.el.num === i))
                    {
                        coll[reserve[1]] = i
                        break
                    }
                }

                answer = this.answerCompare(coll, comparison)
                log.push({num:coll, ans:answer})

                if(answer[0]===log[log.length-2].ans[0])
                {
                    weights[reserve[0]].el.weight[reserve[0]+1] = 1
                    weights[reserve[1]].el.weight[reserve[1]+1] = 0
                    weights[reserve[0]].captured = true
                }
                else
                {
                    weights[reserve[0]].el.weight[reserve[1]+1] = 0
                    weights[reserve[1]].el.weight[reserve[0]+1] = 1
                    weights[reserve[1]].captured = true
                }
                found++
                stage--
                return {weights:weights,reserve:reserve,stage:stage,found:found,log:log}
        
            case 10:
                this.swapElems(weights, reserve)
                for(let i = 0; i<4;i++)
                {
                    coll.push(weights[i].el.num)
                }
                
                for(let i = 0; i<10;i++)
                {
                    if(!weights.find(x => x.el.num === i))
                    {
                        coll[reserve[1]] = i
                        break
                    }
                }

                answer = this.answerCompare(coll, comparison)
                log.push({num:coll, ans:answer})

                if(answer[0]===log[log.length-2].ans[0])
                {
                    weights[reserve[0]].el.weight[reserve[1]+1] = 0
                    weights[reserve[1]].el.weight[reserve[1]+1] = 1
                    weights[reserve[1]].captured = true
                }
                else
                {
                    weights[reserve[0]].el.weight[reserve[0]+1] = 1
                    weights[reserve[1]].el.weight[reserve[1]+1] = 0
                    weights[reserve[0]].captured = true
                }
                stage=8
                return {weights:weights,reserve:reserve,stage:stage,found:found,log:log}
        }
        console.log('out of bounds!!')
        return {weights:weights,reserve:reserve,stage:stage,found:found,log:log}
    },
    swapElems:function(arr, elems){
        const temp = arr[elems[1]]
        arr[elems[1]] = arr[elems[0]]
        arr[elems[0]] = temp
        return arr
    }
}