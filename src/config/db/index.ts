import generateDB from './generateDB';

import requestsInitialData from '../../data/requests';

const DB = generateDB({
  requests: requestsInitialData,
});

export default DB;
