import Hapi from '@hapi/hapi';
import { TState } from '../../data/requests'
import db from '../../config/db';

export default ({ getRequests }) => async ({ params: { state } }: Hapi.Request, h: Hapi.ResponseToolkit) => {
  try {
    const requests = await getRequests(db, state as TState);
    return requests;
  } catch (err) {
    return h.response(err.message || 'Cannot find requests').code(404);
  }
}
