// Import dependecy-registrar first
import './dependency-registrar';

import bodyParser from 'body-parser';
import express, { Request, Response } from 'express';
import session from 'express-session';
import fs from 'fs';
import https from 'https';

import { categoryController } from './controllers/category-controller';
import { lockablesController } from './controllers/lockables-controller';
import { NotImplementedError } from './models/errors';

const app = express();
app.set('trust proxy', true);
app.set('port', process.env.PORT || 8080);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
    resave: true,
    saveUninitialized: true,
    secret: '1234-1234-1234-1234'
}));

app.get('/api/version', (req, res) => {
    console.log(req.url);
    res.json({
        version: '2018-6-18'
    });
});

app.get('/api/retrieve-credentials-for/:username', (req: Request, res: Response) => {
    res.json(new NotImplementedError());
});

app.use('/api', categoryController);

app.use('/api', lockablesController);

// Https credentials
const credentials = {
    pfx: fs.readFileSync('./localhost.pfx'),
    passphrase: 'P@ssw0rd'
};

const server = https.createServer(credentials, app);
server.listen(app.get('port'), () => {
    console.log('App is running @ http://localhost:%d',
        app.get('port'),
        app.get('env'));
});

export default server;