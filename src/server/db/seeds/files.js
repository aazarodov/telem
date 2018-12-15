'use strict';

const log = require('logger-file-fun-line');
const couch = require('../connection');
const filesSchema = require('../../schemas/db/files/files');
const prefix = require('../../utils/prefix');
const {
  patient01Id,
  patient02Id,
  p01File01Id,
  p01File02Id,
  p01File03Id,
  p01File04Id,
  p02File01Id,
} = require('../../../../test/things/values');


const ddoc = {
  _id: '_design/ddoc',
  updates: {
    inplace: `function(doc, req) {
  var allowedKeys = ['name', 'comment'];
  var returnedKeys = ['_id', 'name', 'comment', 'date', 'type', 'length'];
  if (!doc) return [null, {
    'code': 200,
    'json': {
      'error': 'missed doc',
      'reason': 'no document to update'
    }
  }];
  if (!req.body) return [null, {
    'code': 200,
    'json': {
      'error': 'missed body',
      'reason': 'no request body to update'
    }
  }];
  var body = JSON.parse(req.body);
  if (body._owner !== doc.owner) return [null, {
    'code': 200,
    'json': {
      'error': 'access deny',
      'reason': 'owner not match'
    }
  }];
  delete body._owner;
  var isChanged = false;
  Object.keys(body).forEach(function(key) {
    if (allowedKeys.indexOf(key) !== -1 && doc[key] !== body[key]) {
      isChanged = true;
      doc[key] = body[key];
    }
  });
  if (!isChanged) return [null, JSON.stringify(doc, returnedKeys)];
  return [doc, JSON.stringify(doc, returnedKeys)];
}`,
    delete: `function(doc, req) {
  if (!doc) return [null, {
      'code': 200,
      'json': {
          'error': 'missed doc',
          'reason': 'no document to delete'
      }
  }];
  if (!req.body) return [null, {
      'code': 200,
      'json': {
          'error': 'missed body',
          'reason': 'no request body to delete'
      }
  }];
  var body = JSON.parse(req.body);
  if (body._owner !== doc.owner) return [null, {
      'code': 200,
      'json': {
          'error': 'access deny',
          'reason': 'owner not match'
      }
  }];
  doc._deleted = true;
  return [doc, {
      'code': 200,
      'json': {
          'ok': true,
          'message': 'doc deleted'
      }
  }];
}`,
  },
  language: 'javascript',
};

const filesSeeding = async () => {
  const dbname = prefix('files');
  let filesSeeds = [
    {
      _id: p01File01Id,
      owner: patient01Id,
      name: 'Рентгеновский снимок.jpg',
      date: new Date('1995-05-23'),
      type: 'fake/jpg',
      length: 12345324324,
      comment: 'Первый рентгеновский снимок 1985 года',
    },
    {
      _id: p01File02Id,
      owner: patient01Id,
      name: 'Документ.doc',
      date: new Date('2017-07-12T09:22:33'),
      type: 'fake/doc',
      length: 457487343,
      comment: 'Очень важный документ',
    },
    {
      _id: p01File03Id,
      owner: patient01Id,
      name: 'Справочник пчеловода.pdf',
      date: new Date('2018-12-12T23:58:49'),
      type: 'fake/pdf',
      length: 199999999,
      comment: '',
    },
    {
      _id: p01File04Id,
      owner: patient01Id,
      name: 'Инструкция',
      date: new Date('2010-10-10T22:10:30'),
      type: 'fake/pdf',
      length: 435453,
      comment: '',
    },
    {
      _id: p02File01Id,
      owner: patient02Id,
      name: 'Секрет',
      date: new Date('2007-07-07T17:07:17'),
      type: 'fake/blob',
      length: 7777777,
      comment: 'Секрет 02го пациента',
    },
  ];
  try {
    const validatePromises = filesSeeds.map(seed => filesSchema.validate(seed));
    filesSeeds = await Promise.all(validatePromises);
  } catch (error) {
    log('validate filesSeeds error', error);
    return null;
  }
  try {
    await couch.db.destroy(dbname);
  } catch (error) {
    log(`${dbname} does not exist`);
  }
  try {
    await couch.db.create(dbname);
    const db = couch.use(dbname);
    await db.createIndex({
      index: { fields: ['owner'] },
      ddoc: 'indexes',
      name: 'owner',
    });
    filesSeeds.push(ddoc);
    await db.bulk({ docs: filesSeeds });
    log(`${dbname} successfully seeded`);
  } catch (error) {
    log(`${dbname} seeding error`, error);
  }
  return filesSeeds;
};

if (require.main === module) {
  if (!process.env.NODE_ENV) process.env.NODE_ENV = 'test';
  filesSeeding();
}
module.exports = filesSeeding;
