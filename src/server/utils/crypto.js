'use strict';

const crypto = require('crypto');
const log = require('logger-file-fun-line');
const { cipherKey, salt } = require('../../../secrets');

const algorithm = 'aes-256-cbc';
const keyBuffer = Buffer.from(cipherKey, 'base64');

module.exports = {
  hashSync(str) {
    const hash = crypto.createHash('sha256');
    hash.update(`${str}${salt}`);
    return hash.digest('base64');
  },
  async hash(str) {
    const hash = crypto.createHash('sha256');
    return new Promise((resolve) => {
      let hashBuffer;
      hash.on('readable', () => {
        const chunk = hash.read();
        if (chunk) {
          if (Buffer.isBuffer(hashBuffer)) {
            hashBuffer = Buffer.concat([hashBuffer, chunk]);
          } else {
            hashBuffer = chunk;
          }
        }
      });
      hash.on('end', () => {
        resolve(hashBuffer.toString('base64'));
      });
      hash.write(`${str}${salt}`, 'utf8');
      hash.end();
    });
  },
  encryptSync(obj) {
    const data = JSON.stringify(obj);
    const nonce = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(algorithm, keyBuffer, nonce);
    const encryptedBuffer = Buffer.concat([cipher.update(data, 'utf8'), cipher.final()]);
    return Buffer.concat([nonce, encryptedBuffer]).toString('base64');
  },
  async encrypt(obj) {
    const data = JSON.stringify(obj);
    const nonce = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(algorithm, keyBuffer, nonce);
    return new Promise((resolve) => {
      let encryptedBuffer;
      cipher.on('readable', () => {
        const chunk = cipher.read();
        if (chunk) {
          if (Buffer.isBuffer(encryptedBuffer)) {
            encryptedBuffer = Buffer.concat([encryptedBuffer, chunk]);
          } else {
            encryptedBuffer = chunk;
          }
        }
      });
      cipher.on('end', () => {
        resolve(Buffer.concat([nonce, encryptedBuffer]).toString('base64'));
      });
      cipher.write(data, 'utf8');
      cipher.end();
    });
  },
  decryptSync(base64) {
    const dataBuffer = Buffer.from(base64, 'base64');
    const nonce = dataBuffer.slice(0, 16);
    const encryptedBuffer = dataBuffer.slice(16);
    const decipher = crypto.createDecipheriv(algorithm, keyBuffer, nonce);
    const decryptedBuffer = Buffer.concat([decipher.update(encryptedBuffer), decipher.final()]);
    return JSON.parse(decryptedBuffer.toString('utf8'));
  },
  async decrypt(base64) {
    const dataBuffer = Buffer.from(base64, 'base64');
    const nonce = dataBuffer.slice(0, 16);
    const encryptedBuffer = dataBuffer.slice(16);
    const decipher = crypto.createDecipheriv(algorithm, keyBuffer, nonce);
    return new Promise((resolve) => {
      let decryptedBuffer;
      decipher.on('readable', () => {
        const chunk = decipher.read();
        if (chunk) {
          if (Buffer.isBuffer(decryptedBuffer)) {
            decryptedBuffer = Buffer.concat([decryptedBuffer, chunk]);
          } else {
            decryptedBuffer = chunk;
          }
        }
      });
      decipher.on('end', () => {
        resolve(JSON.parse(decryptedBuffer.toString('utf8')));
      });
      decipher.write(encryptedBuffer);
      decipher.end();
    });
  },
};
