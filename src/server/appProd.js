'use strict';

process.env.NODE_ENV = 'production';

const Koa = require('koa');
const https = require('https');
const webSocket = require('ws');
const cors = require('@koa/cors');
const bodyParser = require('koa-bodyparser');
const { readFileSync } = require('fs');
const { join } = require('path');
const log = require('logger-file-fun-line');
const catcher = require('./middleware/catcher');
const subdomain = require('./middleware/subdomain');
const access = require('./middleware/access');
const validator = require('./middleware/validator');
const mountRoutes = require('./utils/koa-router-mount');
const { verifyClient, handleProtocols } = require('./websoket/handshake');
const rpc = require('./websoket/rpc');

const PORT = 443;

const options = {
  key: readFileSync(join(__dirname, '../../cert/privkey.pem')),
  cert: readFileSync(join(__dirname, '../../cert/fullchain.pem')),
};

const app = new Koa();

app.use(catcher());
app.use(subdomain());
app.use(cors({ credentials: true }));
app.use(bodyParser());
app.use(access());
app.use(validator(join(__dirname, 'schemas/routes')));
mountRoutes(app, join(__dirname, 'routes'));

const server = https.createServer(options, app.callback()).listen(PORT, '0.0.0.0', () => {
  log(`Start HTTPS server on ${process.env.NODE_ENV} mode, port: ${PORT}`);
  if (typeof process.send === 'function') process.send('ready');
});

const wss = new webSocket.Server({
  server,
  verifyClient,
  handleProtocols,
});

wss.on('connection', (ws, req) => {
  rpc(ws, req);
});

server.on('close', () => {
  wss.close();
});

process.on('SIGINT', () => {
  log('SIGINT signal received');
  server.close((err) => {
    if (err) {
      log(err);
      process.exit(1);
    }
    process.exit(0);
  });
});

module.exports = server;
