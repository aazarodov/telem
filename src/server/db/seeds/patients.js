'use strict';

const crypto = require('crypto-promise');
const log = require('logger-file-fun-line');
const couch = require('../connection');
const { salt } = require('../../../../secrets');
const patientSchema = require('../../schemas/db/patient');

const dbname = 'test_patients';

const getHash = async (password) => {
  const hash = await crypto.hash('sha256')(`${password}${salt}`);
  return hash.toString('base64');
};

async function patientSeeding() {
  const patientSeeds = [
    {
      mobileNumber: '79876543210',
      email: 'alex@mail.ru', // passwd 1234567
      password: await getHash('1234567'),
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
      email: 'yosif@gmail.com',
      password: await getHash('qwertyu'),
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
      email: 'ann@yahoo.com',
      password: await getHash('34%45w40(UF(H(#H#(RH#(bf3u'),
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
