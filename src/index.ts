// Import dependecy-registrar first
import { container, TYPES } from './dependency-registrar';

import bodyParser from 'body-parser';
import express, { Request, Response } from 'express';
import session from 'express-session';
import fs from 'fs';
import https from 'https';

import { lockablesController } from './controllers/lockables-controller';
import { NotImplementedError, MessageError, InternalError } from './models/errors';
import { Database } from './models/database';

const db = container.get<Database>(TYPES.Database);

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

app.get('/test', async (req: Request, res: Response) => {
    const userRef = await db.collection('lockables')
        .where('name', '==', 'test-user-a')
        .get();

    if (userRef.empty) {
        res.json(new InternalError());
        return;
    }
    const user = userRef.docs[0].ref;

    const categoryRefs = await db.collection('category-lockable-map')
        .where('lockableRef', '==', user)
        .get();

    res.json(categoryRefs.docs.map(doc => doc.data().category));
});

app.use('/api', lockablesController);

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