import _ from 'lodash';

import Hapi from '../../src/config/server';
import Request from '../../src/models/requests';
import DB from '../../src/config/db';

describe('routes/request', () => {
  let Server;
  beforeAll(async () => {
    Server = await Hapi.start();
  });

  describe('GET /request/{state}', () => {
    it('should return an 404 if given no state', async () => {
      const { statusCode } = await Server.inject({
        method: 'GET',
        url: '/request',
      });
      expect(statusCode).toEqual(404);
    });

    it('should return an 400 if given a wrong state', async () => {
      const { statusCode } = await Server.inject({
        method: 'GET',
        url: '/request/wrongState',
      });
      expect(statusCode).toEqual(400);
    });

    it('should return a 200 and a list of requests if given a correct state', async () => {
      const dbRequests = await DB.getFromPath('requests');
      for (let state of ['pending', 'validated', 'archived']) {
        const dbRequestsForState = dbRequests.filter(r => r.state === state);
        const { statusCode, result } = await Server.inject({
          method: 'GET',
          url: `/request/${state}`,
        });

        expect(statusCode).toEqual(200);
        expect(result.length).toEqual(dbRequestsForState.length);
        let getId = r => r.id;
        expect(_.difference(
          result.map(getId),
          dbRequestsForState.map(getId),
        ).length).toEqual(0);
      }
    });
  });

  describe('GET /request/action/{id}', () => {
    it('should return an 400 if given no id', async () => {
      const { statusCode } = await Server.inject({
        method: 'GET',
        url: '/request/action',
      });
      expect(statusCode).toEqual(400);
    });

    it('should return an 404 if given no request found', async () => {
      const { statusCode, message, payload } = await Server.inject({
        method: 'GET',
        url: '/request/action/wrongID',
      });
      expect(payload).toEqual('Request not found');
      expect(statusCode).toEqual(404);
    });

    it('should return code 200 & the correct request for a valid ID', async () => {
      const dbRequests = await DB.getFromPath('requests');
      const { id } = dbRequests[0];
      const { statusCode, result } = await Server.inject({
        method: 'GET',
        url: `/request/action/${id}`,
      });

      expect(statusCode).toEqual(200);
      expect(result.id).toEqual(id);
    });
  });

  describe('POST /request', () => {
    it('should return code 400 if payload is invalid', async () => {
      const badPayloads = [
        undefined,
        null,
        {},
        { state: 'badstate' },
        { state: 'pending', user: {} },
        { state: 'pending', user: { fullName: 'victor' } },
        { state: 'pending', user: { fullName: 'victor', email: 'victor@skillup.co' } },
        {
          state: 'pending',
          user: {
            fullName: 'victor',
            email: 'victor@skillup.co',
            age: 28,
          },
        },
        {
          state: 'pending',
          user: {
            fullName: 'victor',
            email: 'victor@skillup.co',
            age: 28,
            role: 'dev'
          },
          message: {}
        },
      ];

      for (const payload of badPayloads) {
        const { statusCode } = await Server.inject({
          method: 'POST',
          url: '/request',
          payload,
        });
        expect(statusCode).toEqual(400);
      }
    });

    it('should return 200 & the id of the newly created request', async () => {
      const payloads = [
        {
          state: 'pending',
          user: {
            fullName: 'victor',
            email: 'victor@skillup.co',
            age: 28,
            role: 'dev'
          },
          message: 'Besoin de Coca-Cola !',
        },
        {
          state: 'validated',
          user: {
            fullName: 'victor',
            email: 'victor@skillup.co',
            age: 28,
            role: 'dev'
          },
          message: 'Besoin de tester un autre état !',
        },
      ];
      for (const payload of payloads) {
        const { statusCode, result } = await Server.inject({
          method: 'POST',
          url: '/request',
          payload,
        });

        expect(statusCode).toEqual(200);

        const { id } = result;
        expect(id).toBeDefined();

        const requests = await DB.getFromPath('requests')
        const createdRequest = requests.find(r => r.id === id);
        expect(createdRequest.message).toEqual(payload.message);
      }
    });
  });

  const generateStateChangeTest = ({ path, state, expectedState }) => {
    describe(`PATCH /request/${path}id`, () => {
      it('should return an 404 if given no id', async () => {
        const { statusCode } = await Server.inject({
          method: 'PATCH',
          url: `/request/${path}`,
        });
        expect(statusCode).toEqual(404);
      });

      it('should return an 404 if given a wrong id', async () => {
        const { statusCode, payload } = await Server.inject({
          method: 'PATCH',
          url: `/request/${path}wrongID`,
        });
        expect(payload).toEqual('Request not found in database');
        expect(statusCode).toEqual(404);
      });

      it('should return a 200 & correctly change the request state for a valid id', async () => {
        const requests = await DB.getFromPath('requests');
        const groupedByState = _.groupBy(requests, r => r.state);
        let id = groupedByState[state][0].id;
        const { statusCode } = await Server.inject({
          method: 'PATCH',
          url: `/request/${path}${id}`,
        });

        expect(statusCode).toEqual(200);

        const newRequests = await DB.getFromPath('requests');
        const modifiedRequest = newRequests.find(r => r.id === id);
        expect(modifiedRequest.state).toEqual(expectedState);
      });
    });
  };

  for (const path of ['validate/', 'invalidate/', 'archive/']) {
    generateStateChangeTest({
      path,
      state: { 'validate/': 'pending', 'invalidate/': 'validated', 'archive/': 'validated' }[path],
      expectedState: { 'validate/': 'validated', 'invalidate/': 'pending', 'archive/': 'archived' }[path],
    });
  }

  describe('DELETE /request/{id}', () => {
    it('should return an 404 if given no id', async () => {
      const { statusCode } = await Server.inject({
        method: 'DELETE',
        url: '/request',
      });
      expect(statusCode).toEqual(404);
    });

    it('should return an 404 if given a wrong id', async () => {
      const { payload, statusCode } = await Server.inject({
        method: 'DELETE',
        url: '/request/wrongId',
      });

      expect(payload).toEqual('Request not found in database');
      expect(statusCode).toEqual(404);
    });

    it('should return a 200 && delete the request if given a valid ID', async () => {
      const requests = await DB.getFromPath('requests');
      const { id } = requests[0];
      const { statusCode } = await Server.inject({
        method: 'DELETE',
        url: `/request/${id}`,
      });

      expect(statusCode).toEqual(200);
      const newRequests = await DB.getFromPath('requests');
      expect(newRequests.some(r => r.id === id)).toBeFalsy();
    });
  });

  afterAll(async () => Hapi.stop());
});
