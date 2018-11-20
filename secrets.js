'use strict';

module.exports = {
  salt: '{-FF*/m7I#PuG#h_rbJzvcZeab{||46Y)-GNZ_B72-4g?E4k"V',
  cipherKey: 'aRGdfI268+tyCzSUAAm5kqcUDHGfKtLZYezbaXbDkkw=',
  couchdbUrl: 'http://admin:qwe123QWEzxcIOP@telem.ml:5984',
  smsGatewayBaseUrl: 'https://gt.smsgold.ru/sendsms.php?user=mcvita35&pwd=123456&dadr=',
  smsExpiry: 900,
  accessExpiry: 31556926, // 3600 = 1 hour
  registerExpiry: 900, // 900 =  15 min, 1 year = 31556926
  smsCodeSendOnResponce: true, // for testing only smsCode send to browser back
};
