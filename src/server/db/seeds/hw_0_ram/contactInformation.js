'use strict';

const contactInformationSchema = require('../../../schemas/db/contactInformation');
const id = require('../../../utils/_id')('cat.kindsOfContactInformation');

const contactInformationSeeding = async () => {
  const className = 'cat.kindsOfContactInformation';
  const enmName = 'enm.typesOfContactInformation';
  const contactInformationSeeds = [{
    _id: id(),
    name: 'Телефон',
    type: {
      name: 'Телефон',
      presentation: 'Телефон',
      type: enmName,
    },
    class_name: className,
  },
  {
    _id: id(),
    name: 'Факт. адрес',
    type: {
      name: 'Адрес',
      presentation: 'Адрес',
      type: enmName,
    },
    class_name: className,
  },
  {
    _id: id(),
    name: 'E-mail',
    type: {
      name: 'АдресЭлектроннойПочты',
      presentation: 'Адрес электронной почты',
      type: enmName,
    },
    class_name: className,
  },
  {
    _id: id(),
    name: 'Телефон представителя',
    type: {
      name: 'Телефон',
      presentation: 'Телефон',
      type: enmName,
    },
    class_name: className,
  }];
  const validatePromises = contactInformationSeeds.map(
    seed => contactInformationSchema.validate(seed),
  );
  await Promise.all(validatePromises);
  return contactInformationSeeds;
};

module.exports = contactInformationSeeding;
