'use strict';

const crypto = require('crypto-promise');
const couch = require('../connection');
const patientSchema = require('../schemas/patient');
const { salt } = require('../../../../secrets');

const prefix = process.env.NODE_ENV === 'test' ? 'test' : 'telem';
const dbname = `${prefix}_patients`;
const patientsdb = couch.use(dbname);

async function preperePatient(postedPatient) {
  const hash = await crypto.hash('sha256')(postedPatient.Password + salt);
  const today = new Date();
  return {
    ...postedPatient,
    Password: hash.toString('hex').toUpperCase(),
    name: `${postedPatient.Surname} ${postedPatient.FirstName} ${postedPatient.Patronymic}`,
    sex: {
      name: postedPatient.sex,
      presentation: postedPatient.sex,
      type: 'enm.ПолФизическогоЛица',
    },
    status: 'Активен',
    note: `Дата создания: ${today.toISOString().substring(0, 10)}`,
    class_name: 'cat.Patients',
  };
}

module.exports = {

  async getByPhone(phone) {
    const response = await patientsdb.find({ selector: { phone_numbers: phone } });
    if (response.docs.length > 1) throw new Error(`More then one patient witn phone_numbers: ${phone}`);
    return response.docs.length === 1 ? response.docs[0] : null;
  },

  async insertNew(postedPatient) {
    const newPatient = await preperePatient(postedPatient);
    await patientSchema.validate(newPatient);
    return patientsdb.insert(newPatient);
  },
  async updateClean(id, rev, postedPatient) {
    const updPatient = await preperePatient(postedPatient);
    updPatient.status = 'требуется модерация';
    await patientSchema.validate(updPatient);
    return patientsdb.insert({ _id: id, _rev: rev, ...updPatient });
  },
  async updateDataMismatch(foundPatient, patientDataMismatch) {
    const today = new Date();
    const updPatient = {
      ...foundPatient,
      status: 'Не активирован, требуется модерация',
      note: `Дата создания: ${today.toISOString().substring(0, 10)} Несовпадающие данные: ${JSON.stringify(patientDataMismatch)}`,
    };
    // await patientSchema.validate(updPatient);
    return patientsdb.insert(updPatient);
  },
};
