'use strict';

const log = require('logger-file-fun-line');
const couch = require('../connection');
const { hash } = require('../../utils/crypto');
const prefix = require('../../utils/prefix');

const dbname = prefix('hw_0_ram');
const db = couch.use(dbname);
const className = 'cat.doctors';

// indexes: class_name, views: doctorLoginPassword

module.exports = {
  async getById(_id) {
    try {
      const doc = await db.get(_id);
      if (doc.class_name !== className) {
        throw new Error(`getById class_name === ${doc.class_name}, expect ${className}`);
      }
      return doc;
    } catch (error) {
      if (error.error === 'not_found') return null;
      throw error;
    }
  },
  async login(login, password) {
    const response = await db.view('ddoc', 'doctorLoginPassword', {
      key: [login, await hash(password)],
    });
    return response.rows.length > 0 ? response.rows[0].value : null;
  },
};
