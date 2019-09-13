import _ from 'lodash';
import Request, { IRequestDetails, INewRequestData, getRequestFromId } from '../../src/models/requests';
import requestsData, { IDBRequest } from '../../src/data/requests';
import generateDB, { IDB } from '../../src/config/db/generateDB';
import { TState } from '../utils';

describe('models/requests', () => {
  describe('getRequests', () => {
    it('should throw if requests key is not defined in DB', async () => {
      let requests;
      let err;
      const DB = generateDB();
      try {
        requests = await Request.getRequests(DB, 'pending');
      } catch (e) {
        err = e;
      } finally {
        expect(requests).toBeUndefined();
        expect(err.message).toEqual('No "requests" key found in DB');
      }
    });
    it('should return an empty array if there are no requests of the specified type in DB', async () => {
      const DB = generateDB({ requests: requestsData.filter(r => r.state !== 'pending') });
      let requests;
      let err;
      try {
        requests = await Request.getRequests(DB, 'pending');
      } catch (e) {
        err = e;
      } finally {
        expect(requests.length).toEqual(0);
        expect(err).toBeUndefined();
      }
    });
    it('should return the correct amount of requests for a specific state', async () => {
      const DB = generateDB({ requests: requestsData });
      for (let state of ['pending', 'archived', 'validated'] as TState[]) {
        let requests;
        let err;
        try {
          requests = await Request.getRequests(DB, state);
        } catch (e) {
          err = e;
        } finally {
          expect(requests.length).toEqual(
            requestsData.filter(r => r.state === state).length
          );
          expect(err).toBeUndefined();
        }
      }
    });
  });

  describe('getRequestFromId', () => {
    let DB;
    beforeAll(() => {
      DB = generateDB({ requests: requestsData });
    });

    it('should throw if id is invalid', async () => {
      const expectedErrorMessage = 'ID must be a non-empty string';
      let actualErrorMessage;
      try {
        await Request.getRequestFromId(DB, null as string);
      } catch (err) {
        actualErrorMessage = err.message;
      }
      expect(actualErrorMessage).toEqual(expectedErrorMessage);
    });

    it('should throw if no request found', async () => {
      const id = 'dumbid';
      let err;
      let request;
      try {
        request = await Request.getRequestFromId(DB, id);
      } catch (e) {
        err = e;
      }
      expect(err.message).toEqual('Request not found');
      expect(request).toBeUndefined();
    });

    it('should return data and a correct list of actions if request is found', async () => {
      const groupedByStateRequests = _.groupBy(requestsData, (r: IDBRequest) => r.state);
      /** It looks like this
       * {
       *  pending:  IDBRequest[],
       *  validated:  IDBRequest[],
       *  archived: IDBRequest[]
       * } */

      const expectedActions = {
        pending: ['validate', 'delete'],
        validated: ['archive', 'invalidate', 'delete'],
        archived: ['delete', 'reopen'],
      };

      for (let request of [
        groupedByStateRequests.pending[0],
        groupedByStateRequests.validated[0],
        groupedByStateRequests.archived[0],
      ]) {
        let result: IRequestDetails;
        let err;
        try {
          result = await Request.getRequestFromId(DB, request.id);
        } catch (e) {
          err = e;
        }
        expect(err).toBeUndefined();
        expect(result).toBeDefined();
        expect(result.id).toEqual(result.id); // Checking if the request is the same
        expect(_.difference(
          result.actions,
          expectedActions[result.state],
        )).toHaveLength(0);
      }
    });
  });

  for (let stateAction of [
    { label: 'archiveRequest', newState: 'archived', process: Request.archiveRequest },
    { label: 'validateRequest', newState: 'validated', process: Request.validateRequest },
    { label: 'invalidateRequest', newState: 'pending', process: Request.invalidateRequest },
  ]) {
    describe(stateAction.label, () => {
      let DB: IDB;
      beforeAll(() => {
        DB = generateDB({ requests: requestsData });
      });

      it('should return success: false and error message if no id passed as argument', async () => {
        let result, err;
        try {
          result = await stateAction.process(DB, null as string);
        } catch (e) {
          err = e;
        } finally {
          expect(result).toBeUndefined();
          const expectedErrorMessage = 'ID must be a non-empty string';
          expect(err.message).toEqual(expectedErrorMessage);
        }
      });

      it('should return success false if no request found, with info message', async () => {
        let result, err;
        try {
          const id = 'dumbid';
          result = await stateAction.process(DB, id);
        } catch (e) {
          err = e;
        } finally {
          expect(result).toBeUndefined();
          const expectedErrorMessage = 'Request not found in database';
          expect(err.message).toEqual(expectedErrorMessage);
        }
      });

      it('should return success: true if id is valid, and correctly change the state', async () => {
        const id = requestsData[0].id;
        let result, err;
        try {
          result = await stateAction.process(DB, id);
        } catch (e) {
          err = e;
        } finally {
          expect(err).toBeUndefined();
          expect(result.success).toBeTruthy();
          // Now we check that the change actually happend.
          const { requests } = await DB.get() as { requests: Array<IDBRequest> };
          const demandedRequest = requests.find(r => r.id === id);
          expect(demandedRequest.state).toEqual(stateAction.newState);;
        }
      });
    })
  }

  describe('deleteRequest', () => {
    let DB: IDB;
    beforeAll(() => {
      DB = generateDB({ requests: requestsData });
    });

    it('should throw if no id is given', async () => {
      let err, result;
      try {
        result = await Request.deleteRequest(DB, null as string);
      } catch (e) {
        err = e;
      } finally {
        const expectedErrorMessage = 'ID must be a non-empty string';
        expect(err.message).toEqual(expectedErrorMessage);
        expect(result).toBeUndefined();
      }
    });

    it('should throw an error if id is not found', async () => {
      const id = 'dumbid';
      let result, err;
      try {
        result = await Request.deleteRequest(DB, id);
      } catch (e) {
        err = e;
      } finally {
        const expectedErrorMessage = 'Request not found in database';
        expect(err.message).toEqual(expectedErrorMessage);
        expect(result).toBeUndefined();
      }
    });

    it('should return success and effectively delete the request with correct id', async () => {
      const id = requestsData[0].id;
      let result, err;
      try {
        result = await Request.deleteRequest(DB, id);
      } catch (e) {
        err = e;
      } finally {
        expect(result.success).toBeTruthy();
        expect(err).toBeUndefined();

        // Checking if the request has been deleted
        const requests = await DB.getFromPath('requests');
        expect(requests.some(r => r.id === id)).toBeFalsy();
      }

    });
  });

  describe('addRequest', () => {
    let DB: IDB;
    beforeAll(() => {
      DB = generateDB({ requests: requestsData });
    });

    it('should throw if no data is given', async () => {
      const expectedErrorMessage = 'Data required';
      let actualErrorMessage;
      try {
        await Request.addRequest(DB, undefined);
      } catch (err) {
        actualErrorMessage = err.message;
      }
      expect(actualErrorMessage).toEqual(expectedErrorMessage);
    });

    it('should fail and return an error if data is invalid', async () => {
      const data = {
        message: '',
        user: {

        },
      };

      let err, result;
      try {
        result = await Request.addRequest(DB, data as INewRequestData);
      } catch (e) {
        err = e;
      } finally {
        expect(result).toBeUndefined();
        expect(err.message).toEqual('Data must be of INewRequestData format');
      }
    });

    it('should success & effectively create a request', async () => {
      const data: INewRequestData = {
        message: 'Il faut tester !',
        state: 'pending',
        user: {
          fullName: 'Victor Dupuy',
          email: 'victor@skillup.co',
          age: 28,
          role: 'dev',
        },
      };
      let err, result;
      try {
        result = await Request.addRequest(DB, data);
      } catch (e) {
        err = e;
      } finally {
        expect(result.success).toBeTruthy();
        expect(err).toBeUndefined();
        expect(typeof result.id).toEqual('string');

        // Check that the request actually exists in DB now.
        const requests = await DB.getFromPath('requests');
        const newRequest = requests.find((r: IDBRequest) => r.id === result.id);
        expect(newRequest).toBeDefined();
      }
    });
  });
});
