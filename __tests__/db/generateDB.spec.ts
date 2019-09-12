import generateDB from '../../src/config/db/generateDB';
// import { fakeData } from '../utils';
import { isEmpty, get } from 'lodash';

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
    it('should throw if path is invalid', () => {
      const DB = generateDB();
      const expectedErrorMessage = 'Path should be an non-empty string.';
      for (let invalidArgument of [1, {}, []]) {
        try {
          expect(DB.getFromPath(invalidArgument as string));
          throw new Error('Should not arrive here');
        } catch (err) {
          expect(err.message)
            .toEqual(expectedErrorMessage);
        }
      }
    });

    it('should return null if no values in path', () => {
      const DB = generateDB();
      expect(DB.getFromPath('zeaze.azeaz.FDS')).toBeNull();
    });

    it('should return correct data', () => {
      const initialData = {
        x: {
          y: {
            z: 2,
          },
        },
      };
      const DB = generateDB(initialData);
      const actual = DB.getFromPath('x.y.z');
      expect(actual).toEqual(initialData.x.y.z);
    });
  });

  describe('DB.set', () => {
    it('should return an error if path is invalid', async () => {
      const DB = generateDB();
      const expectedErrorMessage = 'Path should be an non-empty string.';
      for (let invalidArgument of [1, {}, []]) {
        const [err, res] = await DB.set(invalidArgument as string, 'yo');
        expect(res).toBeUndefined();
        expect(err.message)
          .toEqual(expectedErrorMessage);
      }
    });

    it('should create a path if it doesn\'t exist yet', async () => {
      const path = 'x.y.z';
      const expectedValue = 'test';
      const DB = generateDB();
      const [err, res] = await DB.set(path, expectedValue);
      expect(err).toBeNull();
      expect(res.success).toBeTruthy();
      expect(get(DB.get(), path)).toEqual(expectedValue);
    });
  });

});
