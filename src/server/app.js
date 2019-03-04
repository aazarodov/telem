'use strict'; 

if (process.env.NODE_ENV === 'multiple') {
  if (process.env.NODE_APP_INSTANCE === '0') process.env.NODE_ENV = 'production';
  if (process.env.NODE_APP_INSTANCE === '1') process.env.NODE_ENV = 'dev1';
  if (process.env.NODE_APP_INSTANCE === '2') process.env.NODE_ENV = 'dev2';
}

const Koa = require('koa');
const cors = require('@koa/cors');
const bodyParser = require('koa-bodyparser');
const path = require('path');
const log = require('logger-file-fun-line');
const catcher = require('./middleware/catcher');
const subdomain = require('./middleware/subdomain');
const access = require('./middleware/access');
const validator = require('./middleware/validator');
const mountRoutes = require('./utils/koa-router-mount');

let PORT;
switch (process.env.NODE_ENV) {
  case 'production': PORT = 80;
    break;
  case 'dev1': PORT = 8081;
    break;
  case 'dev2': PORT = 8082;
    break;
  case 'test': PORT = 9999;
    break;
  default:
    process.exit(1);
    break;
}

const app = new Koa();

app.use(catcher());
app.use(subdomain());
app.use(cors({ credentials: true }));
app.use(bodyParser());
app.use(access());
app.use(validator(path.join(__dirname, 'schemas/routes')));
mountRoutes(app, path.join(__dirname, 'routes'));

const server = app.listen(PORT, () => {
  log(`Start server on ${process.env.NODE_ENV} mode, port: ${PORT}`);
  if (typeof process.send === 'function') process.send('ready');
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
