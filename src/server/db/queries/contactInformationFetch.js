'use strict';

const log = require('logger-file-fun-line');
const couch = require('../connection');
const prefix = require('../../utils/prefix');

const dbname = prefix('hw_0_ram');
const className = 'cat.kindsOfContactInformation';

// indexes: class_name

const prepereFieldValues = (type) => {
  switch (type) {
    case 'Телефон':
      return '<КонтактнаяИнформация xmlns="http://www.v8.1c.ru/ssl/contactinfo" xmlns:xs="http://www.w3.org/2001/XMLSchema" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" Представление="+REPLACEME"><Комментарий/><Состав xsi:type="НомерТелефона" КодСтраны="REPLACEME" КодГорода="" Номер="" Добавочный=""/></КонтактнаяИнформация>';
    case 'АдресЭлектроннойПочты':
      return '<КонтактнаяИнформация xmlns="http://www.v8.1c.ru/ssl/contactinfo" xmlns:xs="http://www.w3.org/2001/XMLSchema" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" Представление="REPLACEME"><Комментарий/><Состав xsi:type="ЭлектроннаяПочта" Значение="REPLACEME"/></КонтактнаяИнформация>';
    case 'Адрес':
      return '<КонтактнаяИнформация xmlns="http://www.v8.1c.ru/ssl/contactinfo" xmlns:xs="http://www.w3.org/2001/XMLSchema" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" Представление="REPLACEME"><Комментарий/><Состав xsi:type="Адрес" Страна="РОССИЯ"><Состав xsi:type="АдресРФ"><Адрес_по_документу>REPLACEME</Адрес_по_документу><ОКТМО>0</ОКТМО><ДопАдрЭл ТипАдрЭл="10100000" Значение=""/></Состав></Состав></КонтактнаяИнформация>"';
    default:
      return '';
  }
};

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
      fieldValues: prepereFieldValues(doc.type.name),
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
