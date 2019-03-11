'use strict';

const log = require('logger-file-fun-line');
const couch = require('../connection');
const patientSchema = require('../../schemas/db/hw_0_ram/cat.patients');
const classNameFetch = require('./classNameFetch');
const contactInformationFetch = require('./contactInformationFetch');
const { hash } = require('../../utils/crypto');
const dateTime = require('../../utils/dateTimeFor1C');
const id = require('../../utils/_id')('cat.patients');
const prefix = require('../../utils/prefix');

const dbname = prefix('hw_0_ram');
const db = couch.use(dbname);
const className = 'cat.patients';

// indexes: class_name, views: patientLoginPassword

let preperePatientHandle = null;
let prepereCityHandle = null;

const preperePatient = async (postedPatient, newStatus, changeStatusOnly) => {
  if (typeof preperePatientHandle === 'function') return preperePatientHandle(postedPatient, newStatus, changeStatusOnly);
  const sex = {
    Мужской: { name: 'Мужской', presentation: 'Мужской', type: 'enm.typesOfSex' },
    Женский: { name: 'Женский', presentation: 'Женский', type: 'enm.typesOfSex' },
  };
  const patientStatuses = await classNameFetch('cat.patientStatuses');
  const contactInformation = await contactInformationFetch();

  preperePatientHandle = async (post, status = 'Новый', changeStatusOnlyFlag = false) => {
    if (changeStatusOnlyFlag) {
      return {
        ...post,
        status: patientStatuses[status],
      };
    }
    return {
      _id: id(),
      name: `${post.lastName} ${post.firstName} ${post.middleName}`,
      lastName: post.lastName,
      firstName: post.firstName,
      middleName: post.middleName,
      sex: sex[post.sex],
      birthDate: dateTime(post.birthDate),
      agreementOfSendingOtherInformation: post.agreementOfSendingOtherInformation,
      agreementOfSendingResults: post.agreementOfSendingResults,
      status: patientStatuses[status],
      note: `Дата создания: ${dateTime()}`,
      password: await hash(post.password),
      contactInformation: [
        {
          ...contactInformation['Телефон'],
          presentation: `+${post.phoneNumber}`,
          phoneNumber: post.phoneNumber,
          fieldValues: contactInformation['Телефон'].fieldValues.replace(/REPLACEME/g, post.phoneNumber),
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

const prepereCity = async (cityName) => {
  if (typeof prepereCityHandle === 'function') return prepereCityHandle(cityName);
  const cities = await classNameFetch('cat.cities');
  prepereCityHandle = cName => cities[cName];
  return prepereCityHandle(cityName);
};

module.exports = {
  async getById(_id) {
    try {
      const doc = await db.get(_id);
      if (doc.class_name !== className) {
        return null;
      }
      return doc;
    } catch (error) {
      if (error.error === 'not_found') return null;
      throw error;
    }
  },
  async getByphoneNumber(phoneNumber) {
    const response = await db.view('ddoc', 'patientLoginPassword', {
      startkey: [phoneNumber],
      endkey: [phoneNumber, {}],
    });
    if (response.rows.length > 1) log(`More then one patient witn phoneNumber: ${phoneNumber}`);
    return response.rows.length > 0 ? response.rows[0].value : null;
  },
  async login(login, password) {
    const response = await db.view('ddoc', 'patientLoginPassword', {
      key: [login, await hash(password)],
    });
    return response.rows.length > 0 ? response.rows[0].value : null;
  },
  async insertNew(postedPatient) {
    const newPatient = await preperePatient(postedPatient);
    await patientSchema.validate(newPatient);
    return db.insert(newPatient);
  },
  async updateClean(_id, _rev, postedPatient) {
    const updPatient = await preperePatient(postedPatient, 'Активен');
    await patientSchema.validate(updPatient);
    return db.insert({ ...updPatient, _id, _rev });
  },
  async resetPassword(foundPatient, password) {
    return db.insert({ ...foundPatient, password: await hash(password) });
  },
  async updateDataMismatch(foundPatient, patientDataMismatch) {
    const updPatient = await preperePatient(
      {
        ...foundPatient,
        note: `Дата создания: ${dateTime()} Несовпадающие данные: ${JSON.stringify(patientDataMismatch)}`,
      },
      'Не активирован',
      true,
    );
    return db.insert(updPatient);
  },
  async updateAgreements(_id, agreements) {
    return db.atomic('ddoc', 'updatePatient', _id, agreements);
  },
  async updateCity(_id, cityName) {
    const city = await prepereCity(cityName);
    if (!city) return { error: 'city not found' };
    return db.atomic('ddoc', 'updatePatient', _id, { city });
  },
  async updateAvatar(_id, avatar) {
    return db.atomic('ddoc', 'updatePatient', _id, { avatar });
  },
};
