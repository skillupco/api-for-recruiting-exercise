import generateDB from '../../src/config/db/generateDB';
// import { fakeData } from '../utils';
import { isEmpty, get } from 'lodash';

/**
 * Some basic tests for generateDB.
 * It handles the basic equivalence test cases
 */
describe('config/generateDB', () => {
  describe('DB', () => {
    it('should throw if given wrong initial data', () => {
      const expectedErrorMessage = 'Initial data should be an object';
      for (let initialTestArgument of [1, 'yolo']) {
        try {
          generateDB(initialTestArgument);
          throw new Error('should not arrive here');
        } catch (err) {
          expect(err.message).toEqual(expectedErrorMessage);
        }
      }
    });

    it('should initialize when given nil initial data', () => {
      for (let initialTestArgument of [null, undefined]) {
        let db;
        try {
          db = generateDB(initialTestArgument);
        } catch (err) {
          throw new Error('should not arrive here');
        }
        expect(db).toBeDefined();
      }
    });

    it('should give access to the expected functions', () => {
      const db = generateDB();
      const dbFunctions = Object.keys(db);
      for (const key of ['get', 'getKeys', 'getFromPath', 'set']) {
        expect(dbFunctions).toContain(key);
      }
    });
  });

  describe('DB.get', () => {
    it('should return an empty object if no initial data', async () => {
      const DB = generateDB();
      expect(isEmpty(await DB.get())).toBeTruthy();
    });

    it('should return expected data', async () => {
      const initialData = { x: 1, y: 2, z: 'yolo'};
      const DB = generateDB(initialData);
      const dbData = await DB.get();
      for (let [key, value] of Object.entries(initialData)) {
        expect(value).toEqual(dbData[key]);
      }
    });
  });

  describe('DB.getKeys', () => {
    it('should return an empty array if no initial data', async () => {
      const DB = generateDB();
      expect(await DB.getKeys()).toHaveLength(0);
    });

    it('should the expected keys', async () => {
      const initialData = {
        x: 1,
        y: 2,
        z: 3,
      };
      const DB = generateDB(initialData);
      const expectedKeys = Object.keys(initialData);
      const actualKeys = await DB.getKeys();
      expect(actualKeys).toHaveLength(expectedKeys.length);
      for (const key of expectedKeys) {
        expect(actualKeys).toContain(key);
      }
    });
  });

  describe('DB.getFromPath', () => {
    it('should throw an error if path is invalid', async () => {
      const DB = generateDB();
      const expectedErrorMessage = 'Path should be an non-empty string.';
      for (let invalidArgument of [1, {}, []]) {
        let err;
        let data;
        try {
          data = await DB.getFromPath(invalidArgument as string);
        } catch(e) {
          err = e;
        }
        // Put the expect here in case it does not throw
        expect(data).toBeUndefined();
        expect(err.message).toEqual(expectedErrorMessage);
      }
    });

    it('should return null if no values in path', async () => {
      const DB = generateDB();
      let data;
      let err;
      try {
        data = await DB.getFromPath('zeaze.azeaz.FDS');
      } catch (e) {
        err = e;
      }
      expect(err).toBeUndefined();
      expect(data).toBeNull();
    });

    it('should return correct data', async () => {
      const initialData = {
        x: {
          y: {
            z: 2,
          },
        },
      };
      const DB = generateDB(initialData);
      let actual;
      let err;

      try {
        actual = await DB.getFromPath('x.y.z');
      } catch (e){
        err = e;
      }

      expect(err).toBeUndefined();
      expect(actual).toEqual(initialData.x.y.z);
    });
  });

  describe('DB.set', () => {
    it('should return an error if path is invalid', async () => {
      const DB = generateDB();
      const expectedErrorMessage = 'Path should be an non-empty string.';
      for (let invalidArgument of [1, {}, []]) {
        let result;
        let err;
        try {
          result = await DB.set(invalidArgument as string, 'yo');
        } catch (e) {
          err = e;
        }

        expect(result).toBeUndefined();
        expect(err.message).toEqual(expectedErrorMessage);
      }
    });

    it('should create a path if it doesn\'t exist yet', async () => {
      const path = 'x.y.z';
      const expectedValue = 'test';
      const DB = generateDB();

      let err;
      let result;
      try {
        result = await DB.set(path, expectedValue);
      } catch (e) {
        err = e;
      }
      expect(err).toBeUndefined();
      expect(result.success).toBeTruthy();
      expect(get(await DB.get(), path)).toEqual(expectedValue);
    });
  });

});
