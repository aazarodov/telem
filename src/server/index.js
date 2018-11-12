'use strict';

const Koa = require('koa');
const bodyParser = require('koa-bodyparser');
const indexRoutes = require('./routes/index');
const authRoutes = require('./routes/auth');
const log = require('./utils/logger');

const app = new Koa();
const PORT = process.env.NODE_ENV === 'test' ? '9999' : process.env.PORT || 8080;

app.use(bodyParser());
app.use(indexRoutes.routes());
app.use(authRoutes.routes());


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
