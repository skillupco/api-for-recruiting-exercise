import requests, { IDBRequest, TState } from '../data/requests';

export interface IRequest {

}

const getRequests = async (state: TState): Promise<IRequest[]> => {
  return requests.filter(r => r.state === state);
}

export interface IRequestDetails {

}
const getRequestFromId = async (id: string): Promise<IRequestDetails> => {
  return {};
}

const validateRequest = async (id: string): Promise<{ success: true } | ReferenceError> => {
  return { success: true };
}

const invalidateRequest = async (id: string): Promise<{ success: true } | ReferenceError> => {
  return { success: true };
}

const archiveRequest = async (id: string): Promise<{ success: true } | ReferenceError> => {
  return { success: true };
}

export interface INewRequestData {

}
const addRequest = async (data: INewRequestData): Promise<string> => {
  return '';
}

export {
  addRequest,
  archiveRequest,
  getRequests,
  getRequestFromId,
  invalidateRequest,
  validateRequest,
};


export default {
  addRequest,
  archiveRequest,
  getRequests,
  getRequestFromId,
  invalidateRequest,
  validateRequest,
};
