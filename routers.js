const mysql = require('mysql');
const mysql_config = require('./mysql_config');

class Routers {
    constructor () {
        this.connection = mysql.createConnection(mysql_config);
        this.connection.connect();
        this.connection.query('CREATE TABLE IF NOT EXISTS personalbest(guid CHAR(17), laptime INT, model CHAR(15), track CHAR(30))');
        this.connection.query('CREATE TABLE IF NOT EXISTS trackbest(guid CHAR(17), laptime INT, model CHAR(15), track CHAR(30))');
        this.connection.query('CREATE TABLE IF NOT EXISTS username(guid CHAR(17), username CHAR(30))');
        this.routers = [
            {
                route: '/personalbest',
                router: async (req, res) => {
                    this.connection.query(`SELECT laptime FROM personalbest WHERE guid=${req.query.guid} AND model='${req.query.model}' AND track='${req.query.track}'`, (error, results) => {
                        res.json({laptime: ((results !== undefined) && (results.length > 0)) ? results[0].laptime : 0});
                    });
                    this.connection.commit();
                }
            },
            {
                route: '/trackbest',
                router: async (req, res) => {
                    this.connection.query(`SELECT * FROM trackbest WHERE model='${req.query.model}' AND track='${req.query.track}'`, (error, results) => {
                        this.connection.query(`SELECT username FROM username WHERE guid='${req.query.guid}`, (error, results2) => {
                            res.json(((results !== undefined) && (results.length > 0)) ? {laptime: results[0].laptime, username: ((results2 !== undefined) && (results2.length > 0)) ? results2[0].username : '', guid: results[0].guid} : undefined);
                        });
                        this.connection.commit();
                    });
                    this.connection.commit();
                }
            },
            {
                route: '/personalbest',
                router: async (req, res) => {
                    this.connection.query(`SELECT * FROM personalbest WHERE track='${req.query.track}' AND model='${req.query.model}' AND guid=${req.body.guid}`, (error, results) => {
                        if ((results !== undefined) && (results.length > 0))  this.connection.query(`UPDATE personalbest SET guid=${req.body.guid} AND laptime=${req.body.laptime} WHERE track='${req.query.track}' AND model='${req.query.model}'`, (error, results) => {});
                        else this.connection.query(`INSERT INTO personalbest (guid, laptime, track, model) VALUES(${req.body.guid}, ${req.body.laptime}, '${req.query.track}', '${req.query.model}')`, (error, results) => {});
                        this.connection.commit();
                    });
                    res.end();
                },
                type: 'post'
            },
            {
                route: '/trackbest',
                router: async (req, res) => {
                    this.connection.query(`SELECT * FROM trackbest WHERE track='${req.query.track}' AND model='${req.query.model}'`, (error, results) => {
                        if ((results !== undefined) && (results.length > 0))  this.connection.query(`UPDATE personalbest SET guid=${req.body.guid} AND laptime=${req.body.laptime} WHERE track='${req.query.track}' AND model='${req.query.model}'`, (error, results) => {});
                        else this.connection.query(`INSERT INTO trackbest (guid, laptime, track, model) VALUES(${req.body.guid}, ${req.body.laptime}, '${req.query.track}', '${req.query.model}')`, (error, results) => {});
                        this.connection.commit();
                    });
                    res.end();
                },
                type: 'post'
            },
            {
                route: '/username',
                router: async (req, res) => {
                    this.connection.query(`SELECT username FROM username WHERE guid=${req.query.guid}`, (err, results) => {
                        if ((results !== undefined) && (results.length > 0))  {
                            if (results[0].username !== req.body.username) this.connection.query(`UPDATE username SET username=? WHERE guid=${req.query.guid}`, [req.body.username], (error, results) => {});
                        } else {
                            this.connection.query(`INSERT INTO username (username, guid) VALUES(?, ${req.query.guid})`, [req.body.username], (error, results) => {});
                        }
                        this.connection.commit();
                    });
                    res.end();
                },
                type: 'post'
            }
        ]
    }
}


module.exports = new Routers();