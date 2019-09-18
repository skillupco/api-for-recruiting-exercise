import uuid from 'uuid/v4';
import _ from 'lodash';
import generateDB from './generateDB';

import requestsInitialData from '../../data/requests';

// const megaData = _.range(50)
//   .map((_) => ({
//     ...requestsInitialData[0],
//     id: uuid(),
//   }))

const DB = generateDB({
  requests: requestsInitialData,
  // requests: megaData,
});

export default DB;
