'use strict';

const log = require('logger-file-fun-line');
const couch = require('../connection');
const patientSchema = require('../../schemas/db/patient');
const patientStatusFetch = require('./patientStatusFetch');
const contactInformationFetch = require('./contactInformationFetch');
const { hash } = require('../../utils/crypto');
const dateTime = require('../../utils/dateTimeFor1C');
const id = require('../../utils/_id')('cat.patients');

const prefix = process.env.NODE_ENV === 'test' ? 'test_' : '';
const dbname = `${prefix}hw_0_ram`;
const patientsdb = couch.use(dbname);
const className = 'cat.patients';

// indexes: class_name, [class_name, password] TODO phoneNumber emailAddress

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
        },
        {
          ...contactInformation['E-mail'],
          presentation: post.email,
          emailAddress: post.email,
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
    const response = await patientsdb.find({
      selector: {
        class_name: className,
        contactInformation: {
          $elemMatch: {
            'kind.presentation': 'Телефон',
            phoneNumber: mobileNumber,
          },
        },
      },
    });
    if (response.docs.length > 1) log(`More then one patient witn mobileNumber: ${mobileNumber}`);
    return response.docs.length > 0 ? response.docs[0] : null;
  },
  async login(login, password) {
    const response = await patientsdb.find({
      selector: {
        class_name: className,
        password: await hash(password),
        $or: [
          {
            contactInformation: {
              $elemMatch: {
                'kind.presentation': 'Телефон',
                phoneNumber: login,
              },
            },
          },
          {
            contactInformation: {
              $elemMatch: {
                'kind.presentation': 'E-mail',
                emailAddress: login,
              },
            },
          },
        ],
      },
    });
    return response.docs.length > 0 ? response.docs[0] : null;
  },
  async insertNew(postedPatient) {
    const newPatient = await preperePatient(postedPatient);
    await patientSchema.validate(newPatient);
    return patientsdb.insert(newPatient);
  },
  async updateClean(_id, _rev, postedPatient) {
    const updPatient = await preperePatient(postedPatient, 'Не активирован');
    await patientSchema.validate(updPatient);
    return patientsdb.insert({ ...updPatient, _id, _rev });
  },
  async updateDataMismatch(foundPatient, patientDataMismatch) {
    const updPatient = await preperePatient({
      ...foundPatient,
      note: `Дата создания: ${dateTime()} Несовпадающие данные: ${JSON.stringify(patientDataMismatch)}`,
    }, 'Не активирован', true);
    return patientsdb.insert(updPatient);
  },
};
