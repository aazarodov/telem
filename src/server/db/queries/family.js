'use strict';

const log = require('logger-file-fun-line');
const couch = require('../connection');
const patientSchema = require('../../schemas/db/hw_0_ram/cat.patients');
const classNameFetch = require('./classNameFetch');
const dateTime = require('../../utils/dateTimeFor1C');
const id = require('../../utils/_id')('cat.patients');
const prefix = require('../../utils/prefix');
const trimId = require('../../utils/trimId');

const dbname = prefix('hw_0_ram');
const db = couch.use(dbname);
const className = 'cat.patients';

let prepereBoundPatientHandle = null;

const relation = {
  Ребенок: { name: 'Ребенок', presentation: 'Ребенок', type: 'enm.typeOfRelations' },
  Родитель: { name: 'Родитель', presentation: 'Родитель', type: 'enm.typeOfRelations' },
  Супруг: { name: 'Супруг', presentation: 'Супруг', type: 'enm.typeOfRelations' },
  Другая: { name: 'Другая', presentation: 'Другая', type: 'enm.typeOfRelations' },
};

const prepereFamilyPatient = async (pid) => {
  const doc = await db.get(pid);
  if (doc.class_name !== className) {
    throw new Error(`prepereFamilyPatient class_name === ${doc.class_name}, expect ${className}`);
  }
  return {
    ref: trimId(pid),
    presentation: doc.name,
    type: className,
  };
};

const prepereBoundPatient = async (pid, postedBoundPatient) => {
  if (typeof preperePatientHandle === 'function') return prepereBoundPatientHandle(pid, postedBoundPatient);
  const sex = {
    Мужской: { name: 'Мужской', presentation: 'Мужской', type: 'enm.typesOfSex' },
    Женский: { name: 'Женский', presentation: 'Женский', type: 'enm.typesOfSex' },
  };
  const revRelation = {
    ...relation,
    Ребенок: { name: 'Родитель', presentation: 'Родитель', type: 'enm.typeOfRelations' },
    Родитель: { name: 'Ребенок', presentation: 'Ребенок', type: 'enm.typeOfRelations' },
  };
  const patientStatuses = await classNameFetch('cat.patientStatuses');
  prepereBoundPatientHandle = async (ppid, post) => ({
    _id: id(),
    name: `${post.lastName} ${post.firstName} ${post.middleName}`,
    lastName: post.lastName,
    firstName: post.firstName,
    middleName: post.middleName,
    sex: sex[post.sex],
    birthDate: dateTime(post.birthDate),
    agreementOfSendingOtherInformation: post.agreementOfSendingOtherInformation,
    agreementOfSendingResults: post.agreementOfSendingResults,
    status: patientStatuses['Новый'],
    family: [
      {
        relation: revRelation[post.relation],
        patient: await prepereFamilyPatient(ppid),
        general: true,
        access: true,
      },
    ],
    note: `Дата создания: ${dateTime()}`,
    password: '',
    class_name: className,
  });
  return prepereBoundPatientHandle(pid, postedBoundPatient);
};

module.exports = {
  async insertNew(pid, postedBoundPatient) {
    const newBoudPatient = await prepereBoundPatient(pid, postedBoundPatient);
    await patientSchema.validate(newBoudPatient);
    return db.insert(newBoudPatient);
  },
  async boundPID(accessPID, dataPID) {
    const response = await db.view('ddoc', 'boundPID', {
      key: [trimId(accessPID), trimId(dataPID)],
    });
    return response.rows.length > 0 ? response.rows[0].value.access : false;
  },
  async accessBy(pid) {
    const trimPID = trimId(pid);
    const response = await db.view('ddoc', 'boundPID', {
      startkey: [trimPID],
      endkey: [trimPID, {}],
    });
    const res = [];
    if (!response.rows.length) return null;
    response.rows.forEach((row) => {
      res.push(row.value);
    });
    return res;
  },
  async addAccess(pid, foundPatientId, foundPatientName, rel, access) {
    const familyElement = {
      relation: relation[rel],
      patient: {
        ref: trimId(foundPatientId),
        presentation: foundPatientName,
        type: className,
      },
      access,
    };
    return db.atomic('ddoc', 'addAccess', pid, familyElement);
  },
  async delAccess(pid, ref) {
    return db.atomic('ddoc', 'delAccess', pid, { ref });
  },
  async updAccess(pid, postData) {
    return db.atomic('ddoc', 'updAccess', pid, postData);
  },
};
