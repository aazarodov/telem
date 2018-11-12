'use strict';

module.exports = {
  apps: [{
    name: 'telem',
    script: './src/server/index.js',
    pid_file: './.pm2/pids/app.pid',
    output: './.pm2/logs/out.log',
    error: './.pm2/logs/error.log',
    // log: './.pm2/logs/outerr.log',
    instances: 2,
    autorestart: true,
    watch: false,
    kill_timeout: 2000,
    listen_timeout: 2000,
    // max_memory_restart: '400M',
    env: {
      NODE_ENV: 'development',
      PORT: '80',
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: '80',
    },
  }],
};
