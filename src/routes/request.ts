import Hapi from '@hapi/hapi';
import Joi from '@hapi/joi';
import db from '../config/db';

import {
  // Functions
  getRequests,
  // Types
  IRequest,
  getRequestFromId,
} from '../models/requests';

import { TState } from '../data/requests';

const routes = [
  {
    method: 'GET',
    path: '/request/{state}',
    handler: async ({ params: { state } }: Hapi.Request, h: Hapi.ResponseToolkit) => {
      try {
        const requests = await getRequests(db, state as TState);
        return requests;
      } catch (err) {
        return h.response(err.message || 'Cannot find requests').code(404);
      }
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
      try {
        const requests = await getRequestFromId(db, state as TState);
        return requests;
      } catch (err) {
        return h.response(err.message || 'Cannot find requests').code(404);
      }
    },
    options: {
      validate: {
        params: {
          id: Joi.string().required(),
        },
      },
    },
  },
];

export default routes;
