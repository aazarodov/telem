'use strict';

const patientStatusSchema = require('../../../schemas/db/patientStatus');
const id = require('../../../utils/_id')('cat.patientStatuses');


const patientStatusesSeeding = async () => {
  const className = 'cat.patientStatuses';
  const patientStatusSeeds = [{
    _id: id(),
    name: 'Активен',
    class_name: className,
  },
  {
    _id: id(),
    name: 'Заблокирован',
    class_name: className,
  },
  {
    _id: id(),
    name: 'Не активирован',
    class_name: className,

  },
  {
    _id: id(),
    name: 'Удален',
    class_name: className,
  },
  {
    _id: id(),
    name: 'Не создан',
    class_name: className,
  },
  {
    _id: id(),
    name: 'Новый',
    class_name: className,
  }];
  const validatePromises = patientStatusSeeds.map(seed => patientStatusSchema.validate(seed));
  await Promise.all(validatePromises);
  return patientStatusSeeds;
};

module.exports = patientStatusesSeeding;
