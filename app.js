const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const sassMiddleware = require('node-sass-middleware');
const HttpError = require('./error/index').HttpError;
const errorHandler = require('express-error-handler');
const session = require('express-session');
const mongoose = require('./libs/mongoose');
const MongoStore = require('connect-mongo')(session);

// const users = require('./routes/users');
const config = require('./config');

const app = express();



// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

// app.use(require('./middleware/loadUser')());
// app.use(require('./middleware/sendHttpError'));


// view engine setup
app.engine('ejs',require('ejs-locals'));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(sassMiddleware({
    src: path.join(__dirname, 'public'),
    dest: path.join(__dirname, 'public'),
    indentedSyntax: true, // true = .sass and false = .scss
    sourceMap: true
}));
app.use(express.static(path.join(__dirname, 'public')));

// error handler
app.use(function(err, req, res, next) {
    if (typeof err === 'number') { // next(404);
        err = new HttpError(err);
    }

    if (err instanceof HttpError) {
        res.sendHttpError(err);
    } else {
        if (app.get('env') === 'development') {
            errorHandler(err, req, res, next);
        } else {
            logger.error(err);
            err = new HttpError(500);
            res.sendHttpError(err);
        }
    }
});


require('./routes')(app);
app.use(session({
    secret: config.get('session:secret'),
    key: config.get('session:key'),
    cookie: config.get('session:cookie'),
    store:  new MongoStore({
        "url": "mongodb://localhost/",
        "db": "session",
    })
}));

app.use(function (req, res, next) {
    req.session.numberOfVisits = req.session.numberOfVisits + 1 || 1;
    res.send("Visits" + req.session.numberOfVisits);
});

app.listen(config.get("port"), function () {
});
module.exports = app;
