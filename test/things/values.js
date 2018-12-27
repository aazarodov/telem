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
  patient01Cookie: '1VdYmtbKj2snF8LM5k8F5XtDVoDq0FXislAF/7HYRZN+meStIFCc7HkXxnt1TLUMwHcL3+9nVH/L/5iew3yg6eLW2Y4TjjSUXWowZbyPaLryjn6tGITAHKdAguPFYhwHYGUemqWAj0pAcvYpPIaQng==',
  notExistId: '00000000-0000-1000-8000-000000000404',
  p01File01Id: '00000000-0000-1000-8000-000000000110',
  p01File02Id: '00000000-0000-1000-8000-000000000120',
  p01File03Id: '00000000-0000-1000-8000-000000000130',
  p01File04Id: '00000000-0000-1000-8000-000000000140',
  p02File01Id: '00000000-0000-1000-8000-000000000210',
  p01laboratoryAnalyzesId: 'doc.laboratoryAnalyzes|a235c23a-049d-11e9-8101-f41614cd568a',
};
