'use strict';

const log = require('logger-file-fun-line');
const couch = require('../connection');

const prefix = process.env.NODE_ENV === 'test' ? 'test_' : '';
const dbname = `${prefix}hw_0_ram`;
const className = 'cat.kindsOfContactInformation';

// indexes: class_name

const contactInformationFetch = async () => {
  const db = couch.use(dbname);
  const contactInformation = {};
  const response = await db.find({
    selector: {
      class_name: className,
    },
  });
  response.docs.forEach((doc) => {
    contactInformation[doc.name] = {
      type: doc.type,
      kind: {
        ref: doc._id.slice(className.length + 1),
        presentation: doc.name,
        type: className,
      },
      presentation: '',
      fieldValues: '',
      country: '',
      region: '',
      city: '',
      emailAddress: '',
      phoneNumber: '',
      phoneNumberWithoutCodes: '',
    };
  });
  return contactInformation;
};

module.exports = contactInformationFetch;
