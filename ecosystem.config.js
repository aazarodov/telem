'use strict';

module.exports = {
  apps: [{
    name: 'telem',
    script: './src/server/app.js',
    pid_file: './.pm2/pids/app.pid',
    output: './.pm2/logs/out.log',
    error: './.pm2/logs/error.log',
    // log: './.pm2/logs/outerr.log',
    instances: 3,
    autorestart: true,
    watch: false,
    kill_timeout: 2000,
    listen_timeout: 2000,
    // max_memory_restart: '400M',
    env: {
      NODE_ENV: 'multiple',
    },
  }],
};
