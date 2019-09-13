import Hapi from '@hapi/hapi';
import Joi from '@hapi/joi';
import db from '../config/db';

import {
  // Functions
  getRequests,
  addRequest,
  // Types
  IRequest,
  getRequestFromId,
  INewRequestData,
} from '../models/requests';

import { TState } from '../data/requests';

const routes = [
  {
    method: 'GET',
    path: '/request/{state}',
    handler: async ({ params: { state } }: Hapi.Request, h: Hapi.ResponseToolkit) => {
      // try {
      //   const requests = await getRequests(db, state as TState);
      //   return requests;
      // } catch (err) {
      //   return h.response(err.message || 'Cannot find requests').code(404);
      // }
    },
    options: {
      validate: {
        params: {
          state: Joi.string().allow(['pending', 'validated', 'archived']).required(),
        },
      },
    },
  },
  {
    method: 'GET',
    path: '/request/action/{id}',
    handler: async ({ params: { state } }: Hapi.Request, h: Hapi.ResponseToolkit) => {
      // try {
      //   const requests = await getRequestFromId(db, state as TState);
      //   return requests;
      // } catch (err) {
      //   return h.response(err.message || 'Cannot find requests').code(404);
      // }
    },
    options: {
      validate: {
        params: {
          id: Joi.string().required(),
        },
      },
    },
  },
  {
    method: 'POST',
    path: '/request',
    handler: async ({ payload }: Hapi.Request, h: Hapi.ResponseToolkit) => {
      // try {
      //   const requests = await addRequest(db, payload as INewRequestData);
      //   return requests;
      // } catch (err) {
      //   return h.response(err.message || 'Cannot find requests').code(404);
      // }
    },
    options: {
      validate: {
        payload: {
          state: Joi.string().required(),
          user: Joi.object({
            fullName: Joi.string().required(),
            email: Joi.string().required(),
            age: Joi.number().required(),
            role: Joi.string().required(),
          }),
          message: Joi.string().required(),
        },
      },
    },
  },
];

export default routes;
