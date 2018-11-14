'use strict';

const couch = require('../connection');
const patientSchema = require('../schemas/patient');
const log = require('../../utils/logger');

const dbname = 'test_patients';

const patientSeeds = [
  {
    mobileNumber: '79876543210',
    email: 'alex@mail.ru', // passwd 1234567
    password: '8bb0cf6eb9b17d0f7d22b456f121257dc1254e1f01665370476383ea776df414',
    name: 'Пушкин Александр Сергеевич',
    surname: 'Пушкин',
    firstName: 'Александр',
    patronymic: 'Сергеевич',
    sex: {
      name: 'Мужской',
      presentation: 'Мужской',
      type: 'enm.ПолФизическогоЛица',
    },
    birthDate: '1799-06-06T00:00:00',
    status: {
      ref: '822eeaa8-e57e-11e8-80de-f69a0bcb2acf',
      presentation: 'Активен',
      type: 'cat.patientStatus',
    },
    note: 'Дата создания 2018-10-24T00:00:00',
    class_name: 'cat.patients',
  },
  {
    mobileNumber: '18765432109',
    email: 'yosif@gmail.com', // passwd qwertyu
    password: '1411242b2139f9fa57a802e1dc172e3e1ca7655ac2d06d83b22958951072261b',
    name: 'Иосиф Александрович Бродский',
    surname: 'Бродский',
    firstName: 'Иосиф',
    patronymic: 'Александрович',
    sex: {
      name: 'Мужской',
      presentation: 'Мужской',
      type: 'enm.ПолФизическогоЛица',
    },
    birthDate: '1940-05-24T00:00:00',
    status: {
      ref: '822eeaa8-e57e-11e8-80de-f69a0bcb2acf',
      presentation: 'Не создан',
      type: 'cat.patientStatus',
    },
    note: '',
    class_name: 'cat.patients',
  },
  {
    mobileNumber: '76005993445',
    email: 'ann@yahoo.com', // passwd 34%45w40(UF(H(#H#(RH#(bf3u
    password: '8260af8b06c2dbbaff678d335f68ccf995048ae7714fbfa1ae63ad0392fb7c30',
    name: 'Ахматова Анна',
    surname: 'Ахматова',
    firstName: 'Анна',
    patronymic: '', // Андреевна
    sex: {
      name: 'Женский',
      presentation: 'Женский',
      type: 'enm.ПолФизическогоЛица',
    },
    birthDate: '1889-06-23T00:00:00',
    status: {
      ref: '822eeaa8-e57e-11e8-80de-f69a0bcb2acf',
      presentation: 'Не создан',
      type: 'cat.patientStatus',
    },
    note: '',
    class_name: 'cat.patients',
  },
];

async function patientSeeding() {
  try {
    await couch.db.destroy(dbname);
  } catch (error) {
    log(`${dbname} does not exist`);
  }
  await couch.db.create(dbname);
  const validatePromises = patientSeeds.map(seed => patientSchema.validate(seed));
  await Promise.all(validatePromises);
  const patientsdb = couch.use(dbname);
  await patientsdb.createIndex({
    index: { fields: ['mobileNumber'] },
    name: 'mobileNumber_index',
  });
  const insertPromises = patientSeeds.map(patientsdb.insert);
  await Promise.all(insertPromises);
  log('patients seeded');
}
module.exports = patientSeeding;
