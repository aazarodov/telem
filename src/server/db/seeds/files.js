'use strict';

const log = require('logger-file-fun-line');
const couch = require('../connection');
const filesSchema = require('../../schemas/db/files/files');
const id = require('../../utils/_id')();
const prefix = require('../../utils/prefix');
const { patient01Id, patient02Id, p02FileId } = require('../../../../test/things/values');

const dbname = prefix('files');

const filesSeeding = async () => {
  let filesSeeds = [
    {
      _id: id(),
      owner: patient01Id,
      name: 'Рентгеновский снимок.jpg',
      date: new Date('1995-05-23'),
      type: 'fake/jpg',
      length: 12345324324,
      comment: 'Первый рентгеновский снимок 1985 года',
    },
    {
      _id: id(),
      owner: patient01Id,
      name: 'Документ.doc',
      date: new Date('2017-07-12T09:22:33'),
      type: 'fake/doc',
      length: 457487343,
      comment: 'Очень важный документ',
    },
    {
      _id: id(),
      owner: patient01Id,
      name: 'Справочник пчеловода.pdf',
      date: new Date('2018-12-12T23:58:49'),
      type: 'fake/pdf',
      length: 199999999,
      comment: '',
    },
    {
      _id: id(),
      owner: patient01Id,
      name: 'Инструкция',
      date: new Date('2010-10-10T22:10:30'),
      type: 'fake/pdf',
      length: 435453,
      comment: '',
    },
    {
      _id: p02FileId,
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
    const insertPromises = filesSeeds.map(db.insert);
    await Promise.all(insertPromises);
    log(`${dbname} successfully seeded`);
  } catch (error) {
    log(`${dbname} seeding error`, error);
  }
  return filesSeeds;
};

if (require.main === module) filesSeeding();

module.exports = filesSeeding;
