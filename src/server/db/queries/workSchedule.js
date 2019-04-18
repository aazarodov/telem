'use strict';

const log = require('logger-file-fun-line');
const couch = require('../connection');
const prefix = require('../../utils/prefix');

const dbname = prefix('hw_0_ram');
const db = couch.use(dbname);

// indexes: doc.workSchedules,specialist.ref,beginDateOfWorkSchedule

const hoursMinutes = datetime => ({
  h: Number.parseInt(datetime.slice(-8, -6), 10),
  m: Number.parseInt(datetime.slice(-5, -3), 10),
  add(dt) {
    const m = this.m + dt.m;
    this.m = m % 60;
    this.h = this.h + dt.h + Math.floor(m / 60);
    return this;
  },
  lt(dt) {
    return dt.h > this.h || (dt.h === this.h && dt.m > this.m);
  },
  toString() {
    const pad = n => (n >= 10 ? `${n}` : `0${n}`);
    return `${pad(this.h)}:${pad(this.m)}`;
  },
});

const getSlots = (begin, end, duration) => {
  const index = Object.assign({}, begin);
  const slots = {};
  while (index.lt(end)) {
    slots[`${index}`] = {
      begin: `${index}`,
      end: `${index.add(duration)}`,
      free: true,
    };
  }
  return slots;
};

const trimDate = dtStr => `${dtStr.slice(0, 10)}`;
const trimTime = dtStr => `${dtStr.slice(-8, -3)}`;

const getDateArray = (gte, lt) => {
  const arr = [];
  const dt = new Date(gte);
  while (dt < new Date(lt)) {
    arr.push({ date: trimDate(dt.toISOString()), day: dt.getDay() || 7 });
    dt.setDate(dt.getDate() + 1);
  }
  return arr;
};

const workSchedule = async (specialist, companies, dateGTE, dateLT) => {
  const firstScheduleResponse = await db.find({
    selector: {
      'specialist.ref': specialist,
      beginDateOfWorkSchedule: {
        $lt: dateGTE,
      },
      'kindOfDocument.name': 'ИзменениеГрафика',
    },
    sort: [
      {
        'specialist.ref': 'desc',
      },
      {
        beginDateOfWorkSchedule: 'desc',
      },
    ],
    limit: 1,
    use_index: [
      'indexes',
      'doc.workSchedules,specialist.ref,beginDateOfWorkSchedule',
    ],
  });
  if (firstScheduleResponse.docs.length !== 1) return null;
  const schedulesResponse = await db.find({
    selector: {
      'specialist.ref': specialist,
      beginDateOfWorkSchedule: {
        $gte: dateGTE,
        $lt: dateLT,
      },
    },
    sort: [
      {
        'specialist.ref': 'asc',
      },
      {
        beginDateOfWorkSchedule: 'asc',
      },
    ],
    limit: Number.MAX_SAFE_INTEGER,
    use_index: [
      'indexes',
      'doc.workSchedules,specialist.ref,beginDateOfWorkSchedule',
    ],
  });
  const schedules = schedulesResponse.docs;
  let actualSchedule = firstScheduleResponse.docs[0].workSchedule;
  const calendar = {};
  getDateArray(dateGTE, dateLT).forEach((dt) => {
    let currentSchedule;
    if (schedules.length !== 0 && schedules[0].beginDateOfWorkSchedule === `${dt.date}T00:00:00`) {
      currentSchedule = schedules[0].workSchedule;
      if (schedules[0].kindOfDocument.name === 'ИзменениеГрафика') {
        actualSchedule = currentSchedule;
      }
      schedules.shift();
    } else {
      currentSchedule = actualSchedule;
    }
    const daySchedule = currentSchedule.find(val => (
      val.dayOfWeekNumber === dt.day
      && companies.includes(val.company.ref)
      && val.kindOfInterval.name === 'РабочееВремя'));
    calendar[dt.date] = {
      date: dt.date,
      day: dt.day,
    };
    if (daySchedule) {
      const begin = hoursMinutes(daySchedule.beginTimeOfWork);
      const end = hoursMinutes(daySchedule.endTimeOfWork);
      const duration = hoursMinutes(daySchedule.durationOfAppointment);
      const company = {
        ref: daySchedule.company.ref,
        presentation: daySchedule.company.presentation,
      };
      Object.assign(calendar[dt.date], {
        begin: `${begin}`,
        end: `${end}`,
        duration: `${duration}`,
        company,
        slots: getSlots(begin, end, duration),
      });
    } else {
      calendar[dt.date].slots = null;
    }
  });
  const appointmentsResponse = await db.find({
    selector: {
      'specialist.ref': specialist,
      'company.ref': { $in: companies },
      beginOfAppointment: {
        $gte: dateGTE,
        $lt: dateLT,
      },
    },
    use_index: [
      'indexes',
      'doc.appointment,specialist.ref,company.ref,beginOfAppointment',
    ],
  });
  const appointments = appointmentsResponse.docs;
  if (appointments.length === 0) return calendar;
  appointments.forEach((val) => {
    const day = calendar[trimDate(val.beginOfAppointment)];
    if (day && day.slots) {
      const slot = day.slots[trimTime(val.beginOfAppointment)];
      if (slot) {
        slot.free = false;
      }
    }
  });
  return calendar;
};
module.exports = workSchedule;
