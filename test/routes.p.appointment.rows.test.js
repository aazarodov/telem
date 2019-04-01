'use strict';

process.env.NODE_ENV = 'test';

const chai = require('chai');
const chaiHttp = require('chai-http');
const chaiThings = require('chai-things');
const log = require('logger-file-fun-line');
const test = require('./things/test')();
const {
  server,
  patient01Cookie,
} = require('./things/values');

const { expect } = chai;
chai.should();
chai.use(chaiThings);
chai.use(chaiHttp);

describe('GET /appointment/rows', () => {
  describe('GET /appointment/rows as patient01', () => {
    it('should return rows for appointment', async () => {
      const res = await chai.request(server)
        .get('/appointment/rows')
        .query({
          cityName: 'Вологда',
          sex: 'male',
          age: 'adult',
        })
        .set('Cookie', `pat=${patient01Cookie}`);
      test(res, 'rows for appointment');
      const rows = res.body.data;
      rows.should.all.have.property('service');
      rows.should.all.have.property('company');
      rows.should.all.have.property('specialist');
      const tree = {
        service: {},
        company: {},
        specialist: {},
      };
      rows.forEach((val) => {
        {
          if (!tree.service[val.service.ref]) {
            tree.service[val.service.ref] = {
              ref: val.service.ref,
              presentation: val.service.presentation,
              company: {},
              specialist: {},
            };
          }
          const { company, specialist } = tree.service[val.service.ref];
          if (!company[val.company.ref]) {
            company[val.company.ref] = {
              ref: val.company.ref,
              presentation: val.company.presentation,
              specialist: [],
            };
          }
          company[val.company.ref].specialist.push(val.specialist);
          if (!specialist[val.specialist.ref]) {
            specialist[val.specialist.ref] = {
              ref: val.specialist.ref,
              presentation: val.specialist.presentation,
              company: [],
            };
          }
          specialist[val.specialist.ref].company.push(val.company);
        }
        {
          if (!tree.company[val.company.ref]) {
            tree.company[val.company.ref] = {
              ref: val.company.ref,
              presentation: val.company.presentation,
              service: {},
              specialist: {},
            };
          }
          const { service, specialist } = tree.company[val.company.ref];
          if (!service[val.service.ref]) {
            service[val.service.ref] = {
              ref: val.service.ref,
              presentation: val.service.presentation,
              specialist: [],
            };
          }
          service[val.service.ref].specialist.push(val.specialist);
          if (!specialist[val.specialist.ref]) {
            specialist[val.specialist.ref] = {
              ref: val.specialist.ref,
              presentation: val.specialist.presentation,
              service: [],
            };
          }
          specialist[val.specialist.ref].service.push(val.service);
        }
        {
          if (!tree.specialist[val.specialist.ref]) {
            tree.specialist[val.specialist.ref] = {
              ref: val.specialist.ref,
              presentation: val.specialist.presentation,
              service: {},
              company: {},
            };
          }
          const { service, company } = tree.specialist[val.specialist.ref];
          if (!service[val.service.ref]) {
            service[val.service.ref] = {
              ref: val.service.ref,
              presentation: val.service.presentation,
              company: [],
            };
          }
          service[val.service.ref].company.push(val.company);
          if (!company[val.company.ref]) {
            company[val.company.ref] = {
              ref: val.company.ref,
              presentation: val.company.presentation,
              service: [],
            };
          }
          company[val.company.ref].service.push(val.service);
        }
      });
      expect(tree
        .service['00000000-0000-1000-8000-000001000001'] // Услуга хирурга номер один
        .company['59f239a6-0383-4689-a625-419b486d1746'] // КДЦ Вита клиника (М.Ульяновой 3)
        .specialist[1]).to.have.ownProperty('presentation', 'Иван Михайлович Сеченов');
      // log(JSON.stringify(tree, null, 4));
    });
  });
});
