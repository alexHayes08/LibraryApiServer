// Import dependecy-registrar first
import './dependency-registrar';

import bodyParser from 'body-parser';
import express from 'express';
import session from 'express-session';

import { sitesController } from './controllers/category-controller';

const app = express();
app.set('port', process.env.PORT || 8080);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
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

app.use('/api', sitesController);

const server = app.listen(app.get('port'), () => {
    console.log('App is running @ http://localhost:%d',
        app.get('port'),
        app.get('env'));
});

export default server;