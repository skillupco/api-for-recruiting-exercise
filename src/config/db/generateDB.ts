import _ from 'lodash';

/**
 * This is an extremely dumb "database" made just for the sake
 * of the exercise. It's limited to basic get & set
 * operations.
 * @param initialData
 */
const generateDB = (initialData = {}) => {
  if (
    typeof initialData !== 'object'
    || !_.isNil(_.get(initialData, 'length')) // covers arrays
  ) {
    throw new Error('Initial data should be an object');
  }

  const db = {
    ...initialData,
  };

  const set = async (path: string, value) => {
    let err;
    let res;
    if (typeof path !== 'string' || path.length === 0) {
      err = new Error('Path should be an non-empty string.');
      return [err];
    }
    _.set(db, path, value);
    return [null, { success: true }];
  }

  const get = () => db;

  const getKeys = () => Object.keys(db);

  const getFromPath = (path: string) => {
    if (typeof path !== 'string' || path.length === 0) {
      throw new Error('Path should be an non-empty string.');
    }
    const value = _.get(db, path, null);
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
