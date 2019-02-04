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
  neverExpiry: 33071673600000,
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
  d01Login: 'luke', // Хирург
  d02Login: 'fedorov', // Офтальмолог
  d03Login: 'leo', // Кардиолог
  d04Login: 'pupkin', // Уволенный хигрург
  d01Password: '123456',
  d02Password: 'qwerty',
  d03Password: 'asdfgh',
  d04Password: 'zxcvbn',
  doctor01Cookie: 'vH9WnTcyKIgLe20hQGXIdj1RxOw/6N9OV+quhA0QxWYXlHK0hD38/Cn1Dkf2dspdgd0++zKIAyk1s6XGfnskc2O4TSVVmpJzqoNYygNWIn8VWBqfoZgslGVUQFjDW4nOk2wmSwCLCM+Zitt4ls8FZDdTvo1dn0/kS7aTH+NQtAk=',
};
