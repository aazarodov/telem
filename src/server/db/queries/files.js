'use strict';

const log = require('logger-file-fun-line');
const couch = require('../../db/connection');
const filesSchema = require('../../schemas/db/files/files');
const id = require('../../utils/_id')();
const prefix = require('../../utils/prefix');

const dbname = prefix('files');
const db = couch.use(dbname);

// indexes: owner
// ddoc updates inplace, delete

module.exports = {
  async create(newFileDoc, ostream) {
    const newDoc = await filesSchema.validate({ _id: id(), ...newFileDoc });
    const createdDoc = await db.insert(newDoc);
    const addedAtt = await new Promise((resolve, reject) => {
      const is = db.attachment.insertAsStream(
        createdDoc.id,
        'attachment',
        null,
        newDoc.type,
        { rev: createdDoc.rev },
        (err, res) => {
          if (err) {
            reject(err);
          } else {
            resolve(res);
          }
        },
      );
      ostream.pipe(is);
    });
    return addedAtt;
  },
  async getAsStream(_id, owner) {
    try {
      const fileDoc = await db.get(_id);
      if (fileDoc.owner !== owner) return null;
    } catch (error) {
      if (error.error === 'not_found') return null;
      throw error;
    }
    return db.attachment.getAsStream(_id, 'attachment');
  },
  async list(owner, limit, bookmark) {
    return db.find({
      selector: {
        owner,
      },
      fields: [
        '_id',
        'name',
        'comment',
        'date',
        'length',
        'type',
      ],
      limit,
      bookmark,
    });
  },
  async count(owner) {
    const filesCount = await db.view('indexes', 'owner', { key: [owner] });
    if (filesCount.rows.length === 0) return 0;
    return filesCount.rows[0].value;
  },
  async update(updDoc, owner) {
    return db.atomic('ddoc', 'inplace', updDoc._id, { ...updDoc, _owner: owner });
  },
  async delete(_id, owner) {
    return db.atomic('ddoc', 'delete', _id, { _owner: owner });
  },
};
