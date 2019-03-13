'use strict';

const log = require('logger-file-fun-line');
const couch = require('../connection');
const { hash } = require('../../utils/crypto');
const prefix = require('../../utils/prefix');

const dbname = prefix('hw_0_ram');
const db = couch.use(dbname);
const className = 'cat.doctors';

// indexes: class_name, views: doctorLoginPassword, update updateDoctorMeta

module.exports = {
  async getById(_id) {
    try {
      const doc = await db.get(_id);
      if (!doc || doc.class_name !== className) {
        return null;
      }
      if (doc.meta) {
        try {
          doc.meta = JSON.parse(doc.meta);
        } catch (er) {
          doc.meta = '';
        }
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
    if (response.rows.length === 0) return null;
    const doc = response.rows[0].value;
    if (doc.meta) {
      try {
        doc.meta = JSON.parse(doc.meta);
      } catch (er) {
        doc.meta = '';
      }
    }
    return doc;
  },
  async getByLogin(login) {
    const response = await db.view('ddoc', 'doctorLoginPassword', {
      startkey: [login],
      endkey: [login, {}],
    });
    if (response.rows.length > 1) log(`More then one doctor witn login: ${login}`);
    if (response.rows.length === 0) return null;
    const doc = response.rows[0].value;
    if (doc.meta) {
      try {
        doc.meta = JSON.parse(doc.meta);
      } catch (er) {
        doc.meta = '';
      }
    }
    return doc;
  },
  async updateMeta(_id, data) {
    return db.atomic('ddoc', 'updateDoctorMeta', _id, data);
  },
};
