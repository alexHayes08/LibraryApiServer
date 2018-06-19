import bodyParser from 'body-parser';
import express from 'express';
import session from 'express-session';

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
    resave: true,
    saveUninitialized: true,
    secret: '1234-1234-1234-1234'
}));

const server = app.listen(app.get('port'), () => {
    console.log('App is running @ http://localhost:%d',
        app.get('port'),
        app.get('env'));
});

export default server;