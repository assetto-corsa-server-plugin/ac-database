const express = require('express');
const qs = require('qs');
const bodyParser = require('body-parser');
const fs = require('fs');
const routers = require('./routers').routers;
const config = require('./config');

const app = express();

app.set('query parser', (str) => {
    return qs.parse(str)
});

app.use((err, req, res, next) => {
    console.error(err, req.query, req.body);
    fs.writeFile(`/logs/${Date.now()}.log`, 'utf8', String(err) + '\n\n' + String(req));
});


app.use(bodyParser.json());

const r = express.Router();
for (const router of routers) {
    if (router.type === 'get' || router.type === undefined) {
        r.route(router.route).get(router.router);
    } else {
        r.route(router.route).post(router.router);
    }
}

app.use('/', r);

app.listen(config.PORT, () => {
    console.log('listening on port ' + config.PORT);
})