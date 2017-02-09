import Express from 'express';
import Routes from './api/routes/routes';
import BodyParser from 'body-parser'
import Morgan from 'morgan';
import Fs from 'fs';
import Path from 'path';

const cluster = require('cluster');
const numCPUs = require('os').cpus().length;

if(cluster.isMaster) {
    console.log('Master cluster setting up ' + numCPUs+ ' workers...');

    for(let i = 0; i < numCPUs; i++) {
        cluster.fork();
    }

    cluster.on('online', function(worker) {
        console.log('Worker ' + worker.process.pid + ' is online');
    });

    cluster.on('exit', function(worker, code, signal) {
        console.log('Worker ' + worker.process.pid + ' died with code: ' + code + ', and signal: ' + signal);
        console.log('Starting a new worker');
        cluster.fork();
    });
} else {
    let app = Express();
    let port = 8080;
    //let accessLogStream = Fs.createWriteStream(Path.join(__dirname, 'logs/access' + process.pid + '.log'), {flags: 'a'});

    app.use(BodyParser.urlencoded({extended: false }));

    app.use(BodyParser.json());
    //app.use(Morgan('dev', {stream: accessLogStream}));

    app.use('/api', Routes.getApiRoutes());

    app.listen(port, () => {
        console.log('Listening on http://localhost' + port);
    });
}
