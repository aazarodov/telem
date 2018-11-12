'use strict';

const couch = require('../connection');
const patientSchema = require('../schemas/patient');
const log = require('../../utils/logger');

const dbname = 'test_patients';

const patientSeeds = [
  {
    phone_numbers: '79876543210',
    email: 'alex@mail.ru', // passwd 1234567
    Password: '8BB0CF6EB9B17D0F7D22B456F121257DC1254E1F01665370476383EA776DF414',
    name: 'Пушкин Александр Сергеевич',
    Surname: 'Пушкин',
    FirstName: 'Александр',
    Patronymic: 'Сергеевич',
    sex: {
      name: 'Мужской',
      presentation: 'Мужской',
      type: 'enm.ПолФизическогоЛица',
    },
    birth_date: '1799-06-06',
    status: 'Активен',
    note: 'Дата регистрации 2018-10-24',
    class_name: 'cat.Patients',
  },
  {
    phone_numbers: '18765432109',
    email: 'yosif@gmail.com', // passwd qwertyu
    Password: '1411242B2139F9FA57A802E1DC172E3E1CA7655AC2D06D83B22958951072261B',
    name: 'Иосиф Александрович Бродский',
    Surname: 'Бродский',
    FirstName: 'Иосиф',
    Patronymic: 'Александрович',
    sex: {
      name: 'Мужской',
      presentation: 'Мужской',
      type: 'enm.ПолФизическогоЛица',
    },
    birth_date: '1940-05-24',
    status: 'Не создан',
    note: '',
    class_name: 'cat.Patients',
  },
  {
    phone_numbers: '76005993445',
    email: 'ann@yahoo.com', // passwd 34%45w40(UF(H(#H#(RH#(bf3u
    Password: '8260AF8B06C2DBBAFF678D335F68CCF995048AE7714FBFA1AE63AD0392FB7C30',
    name: 'Ахматова Анна',
    Surname: 'Ахматова',
    FirstName: 'Анна',
    Patronymic: '', // Андреевна
    sex: {
      name: 'Женский',
      presentation: 'Женский',
      type: 'enm.ПолФизическогоЛица',
    },
    birth_date: '1889-06-23',
    status: 'Не создан',
    note: '',
    class_name: 'cat.Patients',
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
    index: { fields: ['phone_numbers'] },
    name: 'phone_numbers_index',
  });
  const insertPromises = patientSeeds.map(patientsdb.insert);
  await Promise.all(insertPromises);
  log('patients seeded');
}
module.exports = patientSeeding;
