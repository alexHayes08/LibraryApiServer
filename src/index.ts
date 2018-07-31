// Import dependecy-registrar first
import * as dependecyRegistrar from './dependency-registrar';

import bodyParser from 'body-parser';
import cors from 'cors';
import express, { Request, Response } from 'express';
import session from 'express-session';
import fs from 'fs';
import https from 'https';

import './config/mongoose.config';
import { lockablesController } from './controllers/lockables-controller';
import { lockController } from './controllers/lock-controller';

const app = express();
app.set('trust proxy', true);
app.set('port', process.env.PORT || 8080);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
app.use(session({
    resave: true,
    saveUninitialized: true,
    secret: '1234-1234-1234-1234'
}));

app.get('/api/version', (req, res) => {
    res.json({
        version: '2018-6-18'
    });
});

app.get('/api/running', (req, res) => {
    res.status(200).end();
});

app.use('/api', lockablesController);
app.use('/api', lockController);

/**
 * 404 handler.
 */
app.all('*', (req, res) => {
    res.status(404).json(new Error('Resource not found.'));
});

// Https credentials
const credentials = {
    pfx: fs.readFileSync('./localhost.pfx'),
    passphrase: 'P@ssw0rd'
};

const server = https.createServer(credentials, app);
server.listen(app.get('port'), () => {
    console.log('App is running @ https://localhost:%d',
        app.get('port'),
        app.get('env'));
});

export default server;