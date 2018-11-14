'use strict';

const crypto = require('crypto-promise');
const couch = require('../connection');
const patientSchema = require('../schemas/patient');
const dateTime = require('../../utils/dateTimeFor1C');
const { salt } = require('../../../../secrets');

const prefix = process.env.NODE_ENV === 'test' ? 'test' : 'telem';
const dbname = `${prefix}_patients`;
const patientsdb = couch.use(dbname);

const preperePatient = async function preperePatient(postedPatient, status = 'Активен') {
  const hash = await crypto.hash('sha256')(postedPatient.password + salt);
  return {
    ...postedPatient,
    password: hash.toString('hex'),
    name: `${postedPatient.surname} ${postedPatient.firstName} ${postedPatient.patronymic}`,
    sex: {
      name: postedPatient.sex,
      presentation: postedPatient.sex,
      type: 'enm.ПолФизическогоЛица',
    },
    status: {
      ref: '822eeaa8-e57e-11e8-80de-f69a0bcb2acf',
      presentation: status,
      type: 'cat.patientStatus',
    },
    birthDate: dateTime(postedPatient.birthDate),
    note: `Дата создания: ${dateTime()}`,
    class_name: 'cat.patients',
  };
};

module.exports = {

  async getByPhone(phone) {
    const response = await patientsdb.find({ selector: { mobileNumber: phone } });
    if (response.docs.length > 1) throw new Error(`More then one patient witn mobileNumber: ${phone}`);
    return response.docs.length === 1 ? response.docs[0] : null;
  },
  async login(login, passwd) {
    const hash = await crypto.hash('sha256')(passwd + salt);
    const response = await patientsdb.find({
      selector: {
        $or: [
          { mobileNumber: login },
          { email: login },
        ],
        password: hash.toString('hex'),
      },
    });
    return response.docs.length === 1 ? response.docs[0] : null;
  },
  async insertNew(postedPatient) {
    const newPatient = await preperePatient(postedPatient);
    await patientSchema.validate(newPatient);
    return patientsdb.insert(newPatient);
  },
  async updateClean(id, rev, postedPatient) {
    const updPatient = await preperePatient(postedPatient, 'Не активирован');
    await patientSchema.validate(updPatient);
    return patientsdb.insert({ _id: id, _rev: rev, ...updPatient });
  },
  async updateDataMismatch(foundPatient, patientDataMismatch) {
    const updPatient = {
      ...foundPatient,
      note: `Дата создания: ${dateTime()} Несовпадающие данные: ${JSON.stringify(patientDataMismatch)}`,
    };
    updPatient.status.presentation = 'Не активирован';
    return patientsdb.insert(updPatient);
  },
};
