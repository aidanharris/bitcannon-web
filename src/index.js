import path from 'path';
import express from 'express';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import methodOverride from 'method-override';
import session from 'express-session';
import mongoose from 'mongoose';
import compression from 'compression';
import loudRejection from 'loud-rejection';
import {errorHandler, notFoundHandler} from 'express-api-error-handler';

import cleanUp from './cleanup';
import config from './config';
import {
    generalLogger as log,
    mongooseLogger
} from './log';
import {
    api,
    category,
    core,
    search,
    settings,
    torrent
} from './routes';

const app = express();

const boot = opts => {
    opts = opts || {};

    if (opts.log === 'console') {
        log.info = console.log; // eslint-disable-line no-console
        log.warn = console.log; // eslint-disable-line no-console
        log.error = console.error; // eslint-disable-line no-console
    }

    // Stops promises being silent
    loudRejection();

    // Handles thrown errors and logs them
    cleanUp();

    const MongoStore = require('connect-mongo')(session);

    mongoose.Promise = Promise;

    const mongoHost = process.env.MONGO_HOST || config.get('database.mongodb.host');
    const uri = 'mongodb://' + mongoHost + ':' + config.get('database.mongodb.port') + '/' + config.get('database.mongodb.collection');

    if (config.get('database.mongodb.enabled')) {
        mongoose.connect(uri, err => {
            if (err) {
                throw new Error('Cannot connect to mongodb, please check your config.json');
            }
        });
        if (process.env.NODE_ENV !== 'production') {
            mongoose.set('debug', (coll, method, query, doc, options) => {  // eslint-disable-line max-params
                mongooseLogger.debug({
                    query: {
                        coll,
                        method,
                        query,
                        doc,
                        options
                    }
                });
            });
        }
    } else {
        throw new Error('No database is enabled, please check your config.json');
    }

    app.use(session({
        secret: config.get('session.secret'),
        name: 'session',
        store: new MongoStore({
            mongooseConnection: mongoose.connection
        }),
        proxy: true,
        resave: true,
        saveUninitialized: true
    }));

    app.listen(opts.port, () => log.info(`Astro is running on port ${opts.port}`));
};

app.disable('x-powered-by');

app.set('views', path.resolve(__dirname, 'views'));
app.set('view engine', 'pug');
app.use(compression());
app.use(express.static(path.resolve(__dirname, 'public'), {
    maxAge: 86400000
}));
app.use(cookieParser());
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());
app.use(methodOverride());

app.use((req, res, next) => {
    res.locals.title = config.get('app.title');
    res.locals.currentPath = req.originalUrl;
    res.locals.trackers = config.get('trackers');
    next();
});

app.use('/', core);

app.use('/api', api);
app.use('/api/category', category);
app.use('/api/search', search);
app.use('/api/settings', settings);
app.use('/api/torrent', torrent);

app.use('/healthcheck', (req, res) => {
    res.status(200).json({
        uptime: process.uptime()
    });
});

app.use(errorHandler({
    log: ({err, req, body}) => {
        log.error(err, `${body.status} ${req.method} ${req.url}`);
    },
    // This hides 5XX errors in production to prevent info leaking
    hideProdErrors: true
}));

app.use(notFoundHandler({
    log: ({req}) => {
        log.info(`404 ${req.method} ${req.url}`);
    }
}));

if (require.main === module) {
    boot();
}

export default boot;
export {
    app,
    boot
};