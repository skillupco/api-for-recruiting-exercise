import _ from 'lodash';
import Request, { IRequestDetails, INewRequestData } from '../../src/models/requests';
import requestsData, { IDBRequest } from '../../src/data/requests';
import generateDB, { IDB } from '../../src/config/db/generateDB';
import { TState } from '../utils';

describe('models/requests', () => {
  describe('getRequests', () => {
    it('should return an empty array if there are no requests in DB', async () => {
      const DB = generateDB({ requests: [] });
      const requests = await Request.getRequests(DB, 'pending');
      expect(requests.length).toEqual(0);
    });
    it('should return the correct amount of requests for a specific state', async () => {
      const DB = generateDB({ requests: requestsData });
      for (let state of ['pending', 'archived', 'validated'] as TState[]) {
        const requests = await Request.getRequests(DB, state);
        expect(requests.length).toEqual(
          requestsData.filter(r => r.state === state).length
        );
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

    it('should return null if no request found', async () => {
      const id = 'dumbid';
      const data = await Request.getRequestFromId(DB, id);
      expect(data).toBeNull();
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
        const data: IRequestDetails = await Request.getRequestFromId(DB, request.id);
        expect(data).toBeDefined();
        expect(data.id).toEqual(request.id); // Checking if the request is the same
        expect(_.difference(
          data.actions,
          expectedActions[data.state],
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
        const expectedErrorMessage = 'ID must be a non-empty string';
        const { success, err: actualErrorMessage } = await stateAction.process(DB, null as string);
        expect(success).toBeFalsy();
        expect(actualErrorMessage).toEqual(expectedErrorMessage);
      });

      it('should return success false if no request found, with info message', async () => {
        const id = 'dumbid';
        const expectedErrorMessage = 'Request not found in database';
        const { success, err: actualErrorMessage } = await stateAction.process(DB, id);
        expect(success).toBeFalsy();
        expect(actualErrorMessage).toEqual(expectedErrorMessage);
      });

      it('should return success: true if id is valid, and correctly change the state', async () => {
        const id = requestsData[0].id;
        const { success, err: actualErrorMessage } = await stateAction.process(DB, id);
        expect(actualErrorMessage).toBeUndefined();
        expect(success).toBeTruthy();

        // Now we check that the change actually happend.
        const { requests } = await DB.get() as { requests: Array<IDBRequest> };
        const demandedRequest = requests.find(r => r.id === id);
        expect(demandedRequest.state).toEqual(stateAction.newState);;
      });
    })
  }

  describe('deleteRequest', () => {
    let DB: IDB;
    beforeAll(() => {
      DB = generateDB({ requests: requestsData });
    });

    it('should throw if no id is given', async () => {
      const expectedErrorMessage = 'ID must be a non-empty string';
      let actualErrorMessage;
      try {
        await Request.deleteRequest(DB, null as string);
      } catch (err) {
        actualErrorMessage = err.message;
      }
      expect(actualErrorMessage).toEqual(expectedErrorMessage);
    });

    it('should fail & return an error if id is not found', async () => {
      const id = 'dumbid';
      const expectedErrorMessage = 'Request not found in database';
      const { success, err: actualErrorMessage } = await Request.deleteRequest(DB, id);
      expect(success).toBeFalsy();
      expect(actualErrorMessage).toEqual(expectedErrorMessage);
    });

    it('should return success and effectively delete the request with correct id', async () => {
      const id = requestsData[0].id;
      const { success, err: actualErrorMessage } = await Request.deleteRequest(DB, id);
      expect(success).toBeTruthy();
      expect(actualErrorMessage).toBeUndefined();

      // Checking if the request has been deleted
      const [err, requests] = await DB.getFromPath('requests');
      expect(requests.some(r => r.id === id)).toBeFalsy();
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
      const {
        success,
        err: actualErrorMessage,
        id,
      } = await Request.addRequest(DB, data as INewRequestData);
      expect(success).toBeFalsy();
      expect(actualErrorMessage).toEqual('Data must be of INewRequestData format');
      expect(id).toBeUndefined();
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
      const { success, err, id } = await Request.addRequest(DB, data);
      expect(success).toBeTruthy();
      expect(err).toBeUndefined();
      expect(typeof id).toEqual('string');

      // Check that the request actually exists in DB now.
      const [_err, requests] = await DB.getFromPath('requests');
      const newRequest = requests.find((r: IDBRequest) => r.id === id);
      expect(newRequest).toBeDefined();
    });
  });
});
