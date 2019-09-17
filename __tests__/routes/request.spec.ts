import _ from 'lodash';

import HapiServer from '../../src/config/server';
import Hapi from '@hapi/hapi';
import DB from '../../src/config/db';
import { fakeData } from '../utils';

const { requests } = fakeData;

import requestRoutes from '../../src/routes/request';

import changeRequestStateHandler from '../../src/routes/request/changeRequestStateHandler';
import addRequestHandler from '../../src/routes/request/addRequestHandler';
import getRequestHandler from '../../src/routes/request/getRequestHandler';
import getRequestFromIdHandler from '../../src/routes/request/getRequestFromIdHandler';
import deleteRequestHandler from '../../src/routes/request/deleteRequestHandler';

import { INewRequestData } from '../../src/models/requests';

describe('routes/request', () => {
  let Server;
  beforeAll(async () => {
    Server = await HapiServer.start();
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
      for (let state of ['pending', 'validated', 'archived']) {
        const mockedRequestModel = {
          getRequests: jest.fn(async (x, y) => {
            return [requests[0]];
          }),
        };
        const handler = getRequestHandler(mockedRequestModel);
        const server = new Hapi.Server();
        const route = requestRoutes.find(r => r.path === '/request/{state}' && r.method === 'GET');
        server.route({
          ..._.omit(route, 'handler'),
          handler,
        });

        const { statusCode, result } = await server.inject({
          method: 'GET',
          url: `/request/${state}`,
        });

        expect(statusCode).toEqual(200);
        expect(mockedRequestModel.getRequests).toHaveBeenCalledWith(DB, state);
        expect(result).toEqual([requests[0]]);
      }
    });

    // it('should return a 200 and a list of requests if given a correct state', async () => {
    //   const dbRequests = await DB.getFromPath('requests');
    //   for (let state of ['pending', 'validated', 'archived']) {
    //     const dbRequestsForState = dbRequests.filter(r => r.state === state);
    //     const { statusCode, result } = await Server.inject({
    //       method: 'GET',
    //       url: `/request/${state}`,
    //     });

    //     expect(statusCode).toEqual(200);
    //     expect(result.length).toEqual(dbRequestsForState.length);
    //     let getId = r => r.id;
    //     expect(_.difference(
    //       result.map(getId),
    //       dbRequestsForState.map(getId),
    //     ).length).toEqual(0);
    //   }
    // });
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
      const expected = { statusCode: 200, id: '123' };
      const mockedRequestModel = {
        getRequestFromId: jest.fn(async (x, y) => ({ id: expected.id })),
      };
      const handler = getRequestFromIdHandler(mockedRequestModel);
      const route = requestRoutes.find(r => r.path === '/request/action/{id}' && r.method === 'GET');
      const server = new Hapi.Server();
      server.route({
        ...route,
        handler,
      });

      const { statusCode, result } = await server.inject({
        method: 'GET',
        url: `/request/action/${expected.id}`,
      }) as { statusCode: number; result: { id: string } };

      expect(statusCode).toEqual(expected.statusCode);
      expect(result.id).toEqual(expected.id);
      expect(mockedRequestModel.getRequestFromId).toHaveBeenCalledWith(DB, expected.id);
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
        const server = new Hapi.Server();
        const route = requestRoutes.find(r => r.path === '/request' && r.method === 'POST');
        const mockedRequestModel = {
          addRequest: jest.fn((x: INewRequestData) => ({ id: '123' })),
        };

        const handler = addRequestHandler(mockedRequestModel);
        server.route({
          ...route,
          handler,
        });

        const { statusCode, result: { id } } = await server.inject({
          method: 'POST',
          url: '/request',
          payload,
        }) as { statusCode: number, result: { id: string } };

        expect(statusCode).toEqual(200);
        expect(id).toEqual('123');
        expect(mockedRequestModel.addRequest).toHaveBeenCalledWith(DB, payload);
      }
    });
  });

  const generateStateChangeTest = ({ path, handler }) => {
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
        const server = new Hapi.Server();
        const route = requestRoutes.find(r => r.method === 'PATCH' && r.path === `/request/${path}{id}`);
        server.route({
          ...route,
          handler,
        });

        const { statusCode, result: { success } } = await server.inject({
          method: 'PATCH',
          url: `/request/${path}123`,
        }) as { statusCode: number, result: { success: true } };

        expect(statusCode).toEqual(200);
        expect(success).toBeTruthy();
      });
    });
  };

  for (const path of ['validate/', 'invalidate/', 'archive/']) {
    const mockedRequestModel = {
      validateRequest: jest.fn(async (x, y) => ({ success: true })),
      invalidateRequest: jest.fn(async (x, y) => ({ success: true })),
      archiveRequest: jest.fn(async (x, y) => ({ success: true })),
    };

    const handler = {
      'validate/': changeRequestStateHandler(mockedRequestModel, path),
      'invalidate/': changeRequestStateHandler(mockedRequestModel, path),
      'archive/': changeRequestStateHandler(mockedRequestModel, path),
    }[path];

    generateStateChangeTest({
      path,
      handler,
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
      const server = new Hapi.Server();
      const route = requestRoutes.find(r => r.method === 'DELETE' && r.path === '/request/{id}');
      const mockedRequestModel = {
        deleteRequest: () => {
          throw new Error('Request not found in database');
        },
      };
      server.route({
        ...route,
        handler: deleteRequestHandler(mockedRequestModel),
      });

      const { payload, statusCode } = await server.inject({
        method: 'DELETE',
        url: '/request/wrongId',
      });

      expect(payload).toEqual('Request not found in database');
      expect(statusCode).toEqual(404);
    });

    it('should return a 200 && delete the request if given a valid ID', async () => {
      const server = new Hapi.Server();
      const route = requestRoutes.find(r => r.method === 'DELETE' && r.path === '/request/{id}');
      const mockedRequestModel = {
        deleteRequest: () => ({ success: true }),
      };

      server.route({
        ...route,
        handler: deleteRequestHandler(mockedRequestModel),
      });

      const { statusCode, result: { success } } = await server.inject({
        method: 'DELETE',
        url: `/request/123`,
      }) as { statusCode: number, result: { success: boolean } };

      expect(statusCode).toEqual(200);
      expect(success).toBeTruthy();
    });
  });

  afterAll(async () => HapiServer.stop());
});
