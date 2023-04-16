const { Client } = require("pg");

module.exports = {
    queryToDb: function(que, params)
    {
        const client = new Client({
            user: 'gamemanager',
            host: 'localhost',
            database: 'GameLogicConquerrorBase',
            password: 'hanterNet453',
            port: 23014
        });

        return new Promise(function (resolve, reject){
            client.connect();

            client.query(que, params, (err, res) => {
                if (err)
                {
                    console.error(err);
                    reject(0);
                }

                client.end();
                resolve(res.rows);
            });
        });
    },

    queryToDbMain: function(que, params)
    {
        const client = new Client({
            user: 'commonmanager',
            host: 'localhost',
            database: 'CowBullGameBase',
            password: 'hant8312',
            port: 23014
        });

        return new Promise(function (resolve, reject){
            client.connect();

            client.query(que, params, (err, res) => {
                if (err)
                {
                    console.error(err);
                    reject(0);
                }

                client.end();
                resolve(res.rows);
            });
        });
    },

    addDays: function(days) {
        var result = new Date();
        result.setDate(result.getDate() + days);
        return result;
    },
    
    unicNumGenerator: function()
    {
        return parseInt(Math.random()*1000000);
    }
}