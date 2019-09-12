import _ from 'lodash';
import uuid from 'uuid/v4';

import db from '../config/db';
import requests, { IDBRequest, TState, TRole } from '../data/requests';

export interface IRequest {

}

const getRequests = async (DB = db, state: TState): Promise<IRequest[]> => {
  const [err, requests] = DB.getFromPath('requests') as [string, IDBRequest[]];
  return requests.filter(r => r.state === state);
}

type TAction = 'archive'
  | 'delete'
  | 'invalidate'
  | 'reopen'
  | 'validate';

export interface IRequestDetails {
  id: string;
  user: IDBRequest['user'];
  actions: TAction[];
  state: TState;
}

const stateActions: { [x: string]: TAction[] } = {
  pending: ['validate', 'delete'],
  validated: ['archive', 'invalidate', 'delete'],
  archived: ['delete', 'reopen'],
};

const getRequestFromId = async (DB = db, id: string): Promise<IRequestDetails | null> => {
  if (typeof id !== 'string' || id.length === 0) {
    throw new Error('ID must be a non-empty string');
  }

  const [_err, requests] = DB.getFromPath('requests') as [string, IDBRequest[]];
  const demandedRequest = requests.find(r => r.id === id);

  if (!_.isNil(demandedRequest)) {
    return {
      ...demandedRequest,
      actions: stateActions[demandedRequest.state],
    };
  }

  return null;
};

const stateChangeRequest = (newState: TState) =>
  async (DB = db, id: string): Promise<{ success: boolean, err?: string }> => {
    if (!['archived', 'pending', 'validated'].includes(newState)) {
      return { success: false, err: 'Invalid state' };
    }

    try {
      if (typeof id !== 'string' || id.length === 0) {
        throw new Error('ID must be a non-empty string');
      }

      const [_err, requests] = DB.getFromPath('requests') as [string, IDBRequest[]];

      if (!requests.some((r: IDBRequest) => r.id === id)) {
        throw new Error('Request not found in database');
      }

      await DB.set('requests', requests.map(r => {
        if (r.id !== id) {
          return r;
        }
        return { ...r, state: newState };
      }));

      return { success: true };
    } catch (err) {
      return { success: false, err: err.message };
    }
  };

const archiveRequest = stateChangeRequest('archived');
const validateRequest = stateChangeRequest('validated');
const invalidateRequest = stateChangeRequest('pending');

const deleteRequest = async (DB = db, id: string): Promise<{ success: boolean, err?: string }> => {
  if (typeof id !== 'string' || id.length === 0) {
    throw new Error('ID must be a non-empty string');
  }

  try {
    const { requests } = await DB.get() as { requests: IDBRequest[] };
    if (!requests.some((r: IDBRequest) => r.id === id)) {
      throw new Error('Request not found in database');
    }

    await DB.set('requests', requests.filter(r => r.id !== id));
    return { success: true };
  } catch (err) {
    return { success: false, err: err.message };
  }
};

export interface INewRequestData {
  state: TState;
  user: {
    fullName: string;
    email: string;
    age: number;
    role: TRole;
  };
  message: string;
}

const getDataValidation = (data) => {
  return !(
    !['archived', 'pending', 'validated'].includes(data.state)
    || _.isEmpty(data.message)
    || _.isEmpty(data.user)
    || (_.difference(Object.keys(data.user), ['fullName', 'email', 'age', 'role']).length !== 0)
  );
};

const addRequest = async (DB = db, data: INewRequestData): Promise<{ success: boolean, err?: string, id?: string }> => {
  if (
    typeof data !== 'object'
    || !_.isNil(_.get(data, 'length'))
  ) {
    throw new Error('Data required');
  }
  try {
    const dataIsValid = getDataValidation(data);
    if (!dataIsValid) {
      throw new Error('Data must be of INewRequestData format');
    }
    const id = uuid();
    const [_err, requests] = await DB.getFromPath('requests');
    await DB.set('requests', [
      ...requests,
      {
        ...data,
        id,
        createdAt: new Date().valueOf(),
      },
    ]);
    return { success: true, id };
  } catch (err) {
    return { success: false, err: err.message };
  }
};


export {
  addRequest,
  archiveRequest,
  getRequests,
  getRequestFromId,
  invalidateRequest,
  validateRequest,
  deleteRequest,
};


export default {
  addRequest,
  archiveRequest,
  getRequests,
  getRequestFromId,
  invalidateRequest,
  validateRequest,
  deleteRequest,
};
