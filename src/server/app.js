'use strict';

const Koa = require('koa');
const cors = require('@koa/cors');
const bodyParser = require('koa-bodyparser');
const path = require('path');
const log = require('logger-file-fun-line');
const access = require('./middleware/access');
const validator = require('./middleware/validator');
const mountRoutes = require('./utils/koa-router-mount');

const app = new Koa();
const PORT = process.env.NODE_ENV === 'test' ? '9999' : process.env.PORT || 80;

app.use(cors({ credentials: true }));
app.use(bodyParser());
app.use(access());
app.use(validator(path.join(__dirname, 'schemas/routes')));
mountRoutes(app, path.join(__dirname, 'routes'));

const server = app.listen(PORT, () => {
  log(`Server start on port: ${PORT}`);
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
