'use strict';

const Koa = require('koa');
const cors = require('@koa/cors');
const bodyParser = require('koa-bodyparser');
const mountRoutes = require('koa-router-mount');
const path = require('path');
const log = require('logger-file-fun-line');

const app = new Koa();
const PORT = process.env.NODE_ENV === 'test' ? '9999' : process.env.PORT || 80;

app.use(cors());
app.use(bodyParser());
mountRoutes(app, path.join(__dirname, 'routes'));

const server = app.listen(PORT, () => {
  log(`Server start on port: ${PORT}`);
  // graceful start
  if (typeof process.send === 'function') process.send('ready');
});

// graceful shutdown
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
