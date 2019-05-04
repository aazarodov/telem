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

let prepareCityHandle;
let prepareStatusesHandle;
let contactInformationHandle;

const prepareCity = async (cityName) => {
  if (typeof prepareCityHandle === 'function') return prepareCityHandle(cityName);
  const cities = await classNameFetch('cat.cities');
  prepareCityHandle = cName => cities[cName];
  return prepareCityHandle(cityName);
};

const prepareStatuses = async (status) => {
  if (typeof prepareStatusesHandle === 'function') return prepareStatusesHandle(status);
  const patientStatuses = await classNameFetch('cat.patientStatuses');
  prepareStatusesHandle = st => patientStatuses[st];
  return prepareStatusesHandle(status);
};

const prepareContactInformation = async (kindOfCI) => {
  if (typeof contactInformationHandle === 'function') return contactInformationHandle(kindOfCI);
  const contactInformation = await contactInformationFetch();
  contactInformationHandle = kind => contactInformation[kind];
  return contactInformationHandle(kindOfCI);
};

module.exports = {
  async getById(_id) {
    try {
      const doc = await db.get(_id);
      if (!doc || doc.class_name !== className) {
        return null;
      }
      if (doc.meta) {
        try {
          doc.meta = JSON.parse(doc.meta);
        } catch (er) {
          doc.meta = '';
        }
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
    if (response.rows.length === 0) return null;
    const doc = response.rows[0].value;
    if (doc.meta) {
      try {
        doc.meta = JSON.parse(doc.meta);
      } catch (er) {
        doc.meta = '';
      }
    }
    return doc;
  },
  async login(login, password) {
    const response = await db.view('ddoc', 'patientLoginPassword', {
      key: [login, await hash(password)],
    });
    if (response.rows.length === 0) return null;
    const doc = response.rows[0].value;
    if (doc.meta) {
      try {
        doc.meta = JSON.parse(doc.meta);
      } catch (er) {
        doc.meta = '';
      }
    }
    return doc;
  },
  async registerNew(post) {
    const phone = await prepareContactInformation('Телефон');
    const email = await prepareContactInformation('E-mail');
    const newPatient = {
      _id: id(),
      name: `${post.lastName} ${post.firstName} ${post.middleName}`,
      lastName: post.lastName,
      firstName: post.firstName,
      middleName: post.middleName,
      sex: { name: post.sex, presentation: post.sex, type: 'enm.typesOfSex' },
      birthDate: dateTime(post.birthDate),
      agreementOfSendingOtherInformation: post.agreementOfSendingOtherInformation,
      agreementOfSendingResults: post.agreementOfSendingResults,
      status: await prepareStatuses('Новый'),
      note: `Дата создания: ${dateTime()}`,
      password: await hash(post.password),
      contactInformation: [
        {
          ...phone,
          presentation: `+${post.phoneNumber}`,
          phoneNumber: post.phoneNumber,
          fieldValues: phone.fieldValues.replace(/REPLACEME/g, post.phoneNumber),
        },
        {
          ...email,
          presentation: post.email,
          emailAddress: post.email,
          fieldValues: email.fieldValues.replace(/REPLACEME/g, post.email),
        },
      ],
      class_name: className,
    };
    await patientSchema.validate(newPatient);
    return db.insert(newPatient);
  },
  async registerUpdate(foundPatient, post, dataMismatch) {
    if (Object.keys(dataMismatch).length !== 0) {
      return db.atomic('ddoc', 'updatePatient', foundPatient._id, {
        password: foundPatient.password || await hash(post.password),
        status: await prepareStatuses('Не активирован'),
        note: `Дата создания: ${dateTime()} Несовпадающие данные: ${JSON.stringify(dataMismatch)}`,
      });
    }
    const foundEmail = foundPatient.contactInformation.find(val => val.type.name === 'АдресЭлектроннойПочты');
    if (foundEmail) {
      if (foundEmail.emailAddress !== post.email) {
        foundEmail.fieldValues = foundEmail.fieldValues.replace(new RegExp(foundEmail.emailAddress, 'g'), post.email);
        foundEmail.emailAddress = post.email;
        foundEmail.presentation = post.email;
      }
    } else {
      const email = await prepareContactInformation('E-mail');
      foundPatient.contactInformation.push({
        ...email,
        presentation: post.email,
        emailAddress: post.email,
        fieldValues: email.fieldValues.replace(/REPLACEME/g, post.email),
      });
    }
    return db.atomic('ddoc', 'updatePatient', foundPatient._id, {
      password: await hash(post.password),
      status: await prepareStatuses('Активен'),
      note: `Дата создания: ${dateTime()}`,
      agreementOfSendingOtherInformation: post.agreementOfSendingOtherInformation,
      agreementOfSendingResults: post.agreementOfSendingResults,
      contactInformation: foundPatient.contactInformation,
    });
  },
  async resetPassword(_id, password) {
    return db.atomic('ddoc', 'updatePatient', _id, { password: await hash(password) });
  },
  async updateAgreements(_id, agreements) {
    return db.atomic('ddoc', 'updatePatient', _id, agreements);
  },
  async updateCity(_id, cityName) {
    const city = await prepareCity(cityName);
    if (!city) return { error: 'city not found' };
    return db.atomic('ddoc', 'updatePatient', _id, { city });
  },
  async updateAvatar(_id, avatar) {
    return db.atomic('ddoc', 'updatePatient', _id, { avatar });
  },
  async updateMeta(_id, meta) {
    let metaString = '';
    if (meta !== '') {
      try {
        metaString = JSON.stringify(meta);
      } catch (er) {
        metaString = '';
      }
    }
    return db.atomic('ddoc', 'updatePatient', _id, { meta: metaString });
  },
};
