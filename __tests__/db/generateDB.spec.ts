import generateDB from '../../src/config/db/generateDB';
// import { fakeData } from '../utils';
import { isEmpty } from 'lodash';

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
    it('should return an empty object if no initial data', () => {
      const DB = generateDB();
      expect(isEmpty(DB.get())).toBeTruthy();
    });

    it('should return expected data', () => {
      const DB = generateDB({});
    });
  });

  describe('DB.getKeys', () => {
    it('should return an empty array if no initial data', () => {
      const DB = generateDB();
      expect(DB.getKeys()).toHaveLength(0);
    });
    it('should the expected keys', () => {
      const initialData = {
        x: 1,
        y: 2,
        z: 3,
      };
      const DB = generateDB(initialData);
      const expectedKeys = Object.keys(initialData);
      const actualKeys = DB.getKeys();
      expect(actualKeys).toHaveLength(expectedKeys.length);
      for (const key of expectedKeys) {
        expect(actualKeys.includes(key)).toBeTruthy();
      }
    });
  });

  describe('DB.getFromPath', () => {
    it('should throw if path leads to nothing', () => {

    });
  })
});
