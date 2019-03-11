'use strict';

module.exports = {
  server: '127.0.0.1:9999',
  phoneNumber01: '7900000001',
  phoneNumber02: '7900000002',
  phoneNumber03Expired: '7900000003',
  phoneNumber04Expired: '7900000004',
  phoneNumber05New: '7900000005',
  p01phoneNumber: '7900000010', // Пушкин А.С. Активен, основной пациент для тестов
  p02phoneNumber: '7900000020', // Бродский И.А. Не активирован, для тестов register и login
  p03phoneNumber: '7900000030', // Ахматова А.А. Не создан, для тестов register и login
  p04phoneNumber: '7900000040', // Булгаков М.А. Появляется в базе после успешной регистрации
  p01emailAddress: 'alex@mail.ru',
  p02emailAddress: 'yosif@gmail.com',
  p03emailAddress: 'ann@yahoo.com',
  p04emailAddress: 'michel@supermail.io',
  p01Password: '123456',
  p02Password: 'qwerty',
  p03NewPassword: 'asdfgh',
  p04Password: 'buzzword123',
  neverExpiry: 33071673600,
  alwaysExpired: 1544808748,
  patient01Id: 'cat.patients|00000000-0000-1000-8000-000000000001',
  patient02Id: 'cat.patients|00000000-0000-1000-8000-000000000002',
  patient03Id: 'cat.patients|00000000-0000-1000-8000-000000000003',
  patient01Cookie: 'Rq9JzZBIiZ2Fb/cNOh5LPOnqN4HH5/TIMW5IHtunFCsut5P/gfzk/4bQWVmY9WrQ28Ow9uKbu2JZMXwqwWPatXFAUxy4r9i+qowCAhMBEQHNfseukI1X883xoLVnprN5EeN/F3Avry78iQdwSg1gfLgr3sMiqE+687WjGt2Lp5g=',
  notExistId: '00000000-0000-1000-8000-000000000404',
  p01File01Id: '00000000-0000-1000-8000-000000000110',
  p01File02Id: '00000000-0000-1000-8000-000000000120',
  p01File03Id: '00000000-0000-1000-8000-000000000130',
  p01File04Id: '00000000-0000-1000-8000-000000000140',
  p02File01Id: '00000000-0000-1000-8000-000000000210',
  p01laboratoryAnalyzesId: 'doc.laboratoryAnalyzes|a235c23a-049d-11e9-8101-f41614cd568a',
  p02laboratoryAnalyzesId: 'doc.laboratoryAnalyzes|f6eeb127-049d-11e9-8101-f41614cd568a',
  p01barcode: '2122808974',
  doctor01Id: 'cat.doctors|00000000-0000-1000-8000-000000000010',
  doctor02Id: 'cat.doctors|00000000-0000-1000-8000-000000000020',
  doctor03Id: 'cat.doctors|00000000-0000-1000-8000-000000000030',
  doctor04Id: 'cat.doctors|00000000-0000-1000-8000-000000000040',
  doctor05Id: 'cat.doctors|00000000-0000-1000-8000-000000000050',
  doctor06Id: 'cat.doctors|00000000-0000-1000-8000-000000000060',
  d01Login: 'luke', // Хирург
  d02Login: 'fedorov', // Офтальмолог
  d03Login: 'leo', // Кардиолог
  d04Login: 'pupkin', // Уволенный хигрург
  d05Login: 'avril', // Оператор
  d06Login: 'jack', // Оператор
  d01Password: '123456',
  d02Password: 'qwerty',
  d03Password: 'asdfgh',
  d04Password: 'zxcvbn',
  d05Password: 'complicated',
  d06Password: 'tenacious',
  p01SupportChat01Id: '00000000-0000-1000-8000-000000001001', // open not taken
  p01SupportChat02Id: '00000000-0000-1000-8000-000000001002', // open taken op5
  p01SupportChat03Id: '00000000-0000-1000-8000-000000001003', // open taken op6
  p01SupportChat04Id: '00000000-0000-1000-8000-000000001004', // closed op5
  p02SupportChat01Id: '00000000-0000-1000-8000-000000002001', // open not taken
  p02SupportChat02Id: '00000000-0000-1000-8000-000000002002', // open taken op5
  p02SupportChat03Id: '00000000-0000-1000-8000-000000002003', // closed op6
  supportTitle01Id: '00000000-0000-1000-8000-000000010001',
  supportTitle02Id: '00000000-0000-1000-8000-000000010002',
  supportTitle03Id: '00000000-0000-1000-8000-000000010003',
  supportTitle04Id: '00000000-0000-1000-8000-000000010004',
  doctor01Cookie: 'D7j5UNKCSLxxL3rLb7X8VfpzhfwP4sWLIGaSVpJ7KnNsQpp5gI6U5BRQPl5rGYJpFRAwJNmILgvlQWdkaaN5e7ew3K86xgjxzym0ck9BlxwJxN4rZ0Mm1D6HpSSMlC7sGAafm31iDa0VrmtQm4AOO2SMQp0BaagveKF7ST9p7397fIG85v6Wad9AO6TT5G7z',
  doctor05Cookie: 'NKI4p+wuL2zYYZQYubZryLyzr2TETgcIB0ttrpufqw3BO5vKh+W2vEzF4XbEmpVfRe5tUtNMGdL+7RBv3IyTEpN5wmMaDkzsz6i/CDIzDnhIToGbzYkrKUnS7l2CuyqkkvEVFSKUrsFWtfP/HTE1f/OX8CTf0ij7EsAS52w59nfOdbHrXjjwOk1nHSJZ/5lM',
};
