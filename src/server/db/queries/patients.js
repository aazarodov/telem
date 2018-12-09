'use strict';

const log = require('logger-file-fun-line');
const couch = require('../connection');
const patientSchema = require('../../schemas/db/hw_0_ram/cat.patients');
const patientStatusFetch = require('./patientStatusFetch');
const contactInformationFetch = require('./contactInformationFetch');
const { hash } = require('../../utils/crypto');
const dateTime = require('../../utils/dateTimeFor1C');
const id = require('../../utils/_id')('cat.patients');

const prefix = process.env.NODE_ENV === 'test' ? 'test_' : '';
const dbname = `${prefix}hw_0_ram`;
const patientsdb = couch.use(dbname);
const className = 'cat.patients';

// indexes: class_name, views: patientLoginPassword

let preperePatientHandle = null;

const preperePatient = async (postedPatient, newStatus, changeStatusOnly) => {
  if (typeof preperePatientHandle === 'function') return preperePatientHandle(postedPatient, newStatus, changeStatusOnly);
  const sex = {
    Мужской: { name: 'Мужской', presentation: 'Мужской', type: 'enm.typesOfSex' },
    Женский: { name: 'Женский', presentation: 'Женский', type: 'enm.typesOfSex' },
  };
  const patientStatus = await patientStatusFetch();
  const contactInformation = await contactInformationFetch();

  preperePatientHandle = async (post, status = 'Новый', changeStatusOnlyFlag = false) => {
    if (changeStatusOnlyFlag) {
      return {
        ...post,
        status: patientStatus[status],
      };
    }
    return {
      _id: id(),
      name: `${post.surname} ${post.firstName} ${post.patronymic}`,
      lastName: post.surname,
      firstName: post.firstName,
      middleName: post.patronymic,
      sex: sex[post.sex],
      birthDate: dateTime(post.birthDate),
      status: patientStatus[status],
      note: `Дата создания: ${dateTime()}`,
      password: await hash(post.password),
      contactInformation: [
        {
          ...contactInformation['Телефон'],
          presentation: `+${post.mobileNumber}`,
          phoneNumber: post.mobileNumber,
          fieldValues: contactInformation['Телефон'].fieldValues.replace(/REPLACEME/g, post.mobileNumber),
        },
        {
          ...contactInformation['E-mail'],
          presentation: post.email,
          emailAddress: post.email,
          fieldValues: contactInformation['E-mail'].fieldValues.replace(/REPLACEME/g, post.email),
        },
      ],
      class_name: className,
    };
  };
  return preperePatientHandle(postedPatient, newStatus, changeStatusOnly);
};

module.exports = {

  async getById(_id) {
    try {
      const doc = await patientsdb.get(_id);
      return doc;
    } catch (error) {
      if (error.error === 'not_found') return null;
      throw error;
    }
  },
  async getByMobileNumber(mobileNumber) {
    const response = await patientsdb.view('views', 'patientLoginPassword', {
      startkey: [mobileNumber],
      endkey: [mobileNumber, {}],
    });
    if (response.rows.length > 1) log(`More then one patient witn mobileNumber: ${mobileNumber}`);
    return response.rows.length > 0 ? response.rows[0].value : null;
  },
  async login(login, password) {
    const response = await patientsdb.view('views', 'patientLoginPassword', {
      key: [login, await hash(password)],
    });
    return response.rows.length > 0 ? response.rows[0].value : null;
  },
  async insertNew(postedPatient) {
    const newPatient = await preperePatient(postedPatient);
    await patientSchema.validate(newPatient);
    return patientsdb.insert(newPatient);
  },
  async updateClean(_id, _rev, postedPatient) {
    const updPatient = await preperePatient(postedPatient, 'Активен');
    await patientSchema.validate(updPatient);
    return patientsdb.insert({ ...updPatient, _id, _rev });
  },
  async resetPassword(foundPatient, password) {
    return patientsdb.insert({ ...foundPatient, password: await hash(password) });
  },
  async updateDataMismatch(foundPatient, patientDataMismatch) {
    const updPatient = await preperePatient({
      ...foundPatient,
      note: `Дата создания: ${dateTime()} Несовпадающие данные: ${JSON.stringify(patientDataMismatch)}`,
    }, 'Не активирован', true);
    return patientsdb.insert(updPatient);
  },
};
