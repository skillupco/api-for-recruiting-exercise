
import _ from 'lodash';

export interface IDB {
  get: () => object;
  getFromPath: (path: string) => any;
  getKeys: () => string[] | undefined[];
  set: (path: string, value: any) => Promise<[Error | null, { success: true }?]>;
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

  const set = async (path: string, value): Promise<[Error | null, { success: true }?]> => {
    let err;
    if (typeof path !== 'string' || path.length === 0) {
      err = new Error('Path should be an non-empty string.');
      return [err];
    }
    _.set(db, path, value);
    return [null, { success: true }];
  }

  const get = async () => db;

  const getKeys = () => Object.keys(db);

  const getFromPath = (path: string) => {
    let err;
    if (typeof path !== 'string' || path.length === 0) {
      err = new Error('Path should be an non-empty string.');
    }
    return [err, _.get(db, path, null)];
  }

  return {
    get,
    getFromPath,
    getKeys,
    set,
  }
}

export default generateDB;
