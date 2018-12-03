'use strict';

const log = require('logger-file-fun-line');
const patientSchema = require('../../../schemas/db/patient');
const id = require('../../../utils/_id')('cat.patients');
const { hash } = require('../../../utils/crypto');
const patientStatusFetch = require('../../queries/patientStatusFetch');
const contactInformationFetch = require('../../queries/contactInformationFetch');

const patientSeeding = async () => {
  const className = 'cat.patients';
  const sex = {
    Мужской: { name: 'Мужской', presentation: 'Мужской', type: 'enm.typesOfSex' },
    Женский: { name: 'Женский', presentation: 'Женский', type: 'enm.typesOfSex' },
  };
  const patientStatus = await patientStatusFetch();
  const contactInformation = await contactInformationFetch();

  const patientSeeds = [
    {
      _id: id(),
      name: 'Пушкин Александр Сергеевич',
      lastName: 'Пушкин',
      firstName: 'Александр',
      middleName: 'Сергеевич',
      sex: sex['Мужской'],
      birthDate: '1799-06-06T00:00:00',
      status: patientStatus['Активен'],
      note: 'Дата создания 2018-10-24T00:00:00',
      password: await hash('1234567'),
      contactInformation: [
        {
          ...contactInformation['Телефон'],
          presentation: '+79876543210',
          phoneNumber: '79876543210',
          fieldValues: contactInformation['Телефон'].fieldValues.replace(/REPLACEME/g, '79876543210'),
        },
        {
          ...contactInformation['Факт. адрес'],
          presentation: 'г. Москва, ул. Пушкина, д. Колотушкина',
          country: 'РОССИЯ',
          fieldValues: contactInformation['Факт. адрес'].fieldValues.replace(/REPLACEME/g, 'г. Москва, ул. Пушкина, д. Колотушкина'),
        },
        {
          ...contactInformation['E-mail'],
          presentation: 'alex@mail.ru',
          emailAddress: 'alex@mail.ru',
          fieldValues: contactInformation['E-mail'].fieldValues.replace(/REPLACEME/g, 'alex@mail.ru'),
        },
        {
          ...contactInformation['Телефон представителя'],
          presentation: '+78876543210',
          phoneNumber: '78876543210',
          fieldValues: contactInformation['Телефон представителя'].fieldValues.replace(/REPLACEME/g, '78876543210'),
        },
      ],
      class_name: className,
    },
    {
      _id: id(),
      name: 'Иосиф Александрович Бродский',
      lastName: 'Бродский',
      firstName: 'Иосиф',
      middleName: 'Александрович',
      sex: sex['Мужской'],
      birthDate: '1940-05-24T00:00:00',
      status: patientStatus['Не активирован'],
      note: '',
      password: await hash('qwertyu'),
      contactInformation: [
        {
          ...contactInformation['Телефон'],
          presentation: '+78765432109',
          phoneNumber: '78765432109',
          fieldValues: contactInformation['Телефон'].fieldValues.replace(/REPLACEME/g, '78765432109'),

        },
        {
          ...contactInformation['E-mail'],
          presentation: 'yosif@gmail.com',
          emailAddress: 'yosif@gmail.com',
          fieldValues: contactInformation['E-mail'].fieldValues.replace(/REPLACEME/g, 'yosif@gmail.com'),
        },
      ],
      class_name: className,
    },
    {
      _id: id(),
      name: 'Ахматова Анна',
      lastName: 'Ахматова',
      firstName: 'Анна',
      middleName: '', // Андреевна
      sex: sex['Женский'],
      birthDate: '1889-06-23T00:00:00',
      status: patientStatus['Не создан'],
      note: '',
      password: '', // await hash('qwertyu'),
      contactInformation: [
        {
          ...contactInformation['Телефон'],
          presentation: '+76005993445',
          phoneNumber: '76005993445',
          fieldValues: contactInformation['Телефон'].fieldValues.replace(/REPLACEME/g, '76005993445'),
        },
        {
          ...contactInformation['E-mail'],
          presentation: 'ann@yahoo.com',
          emailAddress: 'ann@yahoo.com',
          fieldValues: contactInformation['E-mail'].fieldValues.replace(/REPLACEME/g, 'ann@yahoo.com'),
        },
      ],
      class_name: className,
    },
  ];
  const validatePromises = patientSeeds.map(seed => patientSchema.validate(seed));
  await Promise.all(validatePromises);
  return patientSeeds;
};

module.exports = patientSeeding;
