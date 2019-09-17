import Hapi from '@hapi/hapi';
import Joi from '@hapi/joi';
import db from '../../config/db';

import Request from '../../models/requests';

import addRequestHandler from './addRequestHandler';
import getRequestHandler from './getRequestHandler';
import getRequestFromIdHandler from './getRequestFromIdHandler';
import changeRequestStateHandler from './changeRequestStateHandler';
import deleteRequestHandler from './deleteRequestHandler';

const generateStateChangeRoute = ({
  path,
}) => {
  return {
    method: 'PATCH',
    path: `/request/${path}{id}`,
    handler: changeRequestStateHandler(Request, path),
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
    handler: getRequestHandler(Request),
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
    handler: getRequestFromIdHandler(Request),
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
    handler: addRequestHandler(Request),
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
    handler: deleteRequestHandler(Request),
    options: {
      validate: {
        params: {
          id: Joi.string().required(),
        },
      },
    },
  },
  ...[
    { path: 'validate/' },
    { path: 'invalidate/' },
    { path: 'archive/' },
  ].map(generateStateChangeRoute),
];

export default routes;
