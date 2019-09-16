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
  validateRequest,
  invalidateRequest,
  archiveRequest,
  deleteRequest,
} from '../models/requests';

import { TState } from '../data/requests';

const generateStateChangeRoute = ({
  path,
  model,
}) => {
  return {
    method: 'PATCH',
    path: `/request/${path}{id}`,
    handler: async ({ params: { id } }: Hapi.Request, h: Hapi.ResponseToolkit) => {
      try {
        const { success } = await model(db, id as string);
        return { success };
      } catch (err) {
        if (err.message === 'Request not found in database') {
          return h.response(err.message).code(404);
        }

        return h.response(err.message || 'Cannot create request').code(400);
      }
    },
    options: {
      validate: {
        params: {
          id: Joi.string().required(),
        },
      },
    },
  };
};

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
          state: Joi.string().valid('pending', 'validated', 'archived').required(),
        },
      },
    },
  },
  {
    method: 'GET',
    path: '/request/action/{id}',
    handler: async ({ params: { id } }: Hapi.Request, h: Hapi.ResponseToolkit) => {
      try {
        const requests = await getRequestFromId(db, id);
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
  {
    method: 'POST',
    path: '/request',
    handler: async ({ payload }: Hapi.Request, h: Hapi.ResponseToolkit) => {
      try {
        const { id } = await addRequest(db, payload as INewRequestData);
        return { id };
      } catch (err) {
        return h.response(err.message || 'Cannot create request').code(400);
      }
    },
    options: {
      validate: {
        payload: {
          state: Joi.string().valid('pending', 'validated').required(),
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
  {
    method: 'DELETE',
    path: '/request/{id}',
    handler: async ({ params: { id } }: Hapi.Request, h: Hapi.ResponseToolkit) => {
      try {
        const { success } = await deleteRequest(db, id);
        return { success };
      } catch (err) {
        if (err.message === 'Request not found in database') {
          return h.response(err.message).code(404);
        }
        return h.response(err.message || 'Cannot delete request').code(400);
      }
    }
  },
  ...[
    { path: 'validate/', model: validateRequest },
    { path: 'invalidate/', model: invalidateRequest },
    { path: 'archive/', model: archiveRequest },
  ].map(generateStateChangeRoute),
];

export default routes;
