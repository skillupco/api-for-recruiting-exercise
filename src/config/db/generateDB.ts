import _ from 'lodash';

/**
 * This is an extremely simple database made just for the sake
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

  const set = (path, value) => {
    _.set(db, path, value);
  }

  const get = () => db;

  const getKeys = () => Object.keys(db);
  const getFromPath = (path) => {
    const value = _.get(db, path);
    if (_.isNil(value)) {
      throw new ReferenceError('No value found for this path');
    }

    return value;
  }

  return {
    get,
    getFromPath,
    getKeys,
    set,
  }
}

export default generateDB;
