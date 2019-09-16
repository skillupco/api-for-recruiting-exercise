
import _ from 'lodash';

export interface IDB {
  get: () => Promise<object>;
  getFromPath: (path: string) => Promise<any>;
  getKeys: () => Promise<string[] | undefined[]>;
  set: (path: string, value: any) => Promise<{ success: true }>;
}

/**
 * This is an extremely dumb "database" made just for the sake
 * of the exercise. It's limited to basic get & set
 * operations.
 * @param initialData
 */
const generateDB = (initialData = {}): IDB => {
  if (
    typeof initialData !== 'object'
    || !_.isNil(_.get(initialData, 'length')) // covers arrays
  ) {
    throw new Error('Initial data should be an object');
  }

  const db = {
    ...initialData,
  };

  const set = async (path: string, value): Promise<{ success: true }> => {
    if (typeof path !== 'string' || path.length === 0) {
      throw new Error('Path should be an non-empty string.');
    }
    _.set(db, path, value);
    return { success: true };
  }

  const get = async () => db;

  const getKeys = async () => Object.keys(db);

  const getFromPath = async (path: string) => {
    if (typeof path !== 'string' || path.length === 0) {
      throw new Error('Path should be an non-empty string.');
    }
    return _.get(db, path, null);
  }

  return {
    get,
    getFromPath,
    getKeys,
    set,
  }
}

export default generateDB;
