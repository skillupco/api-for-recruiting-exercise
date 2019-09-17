import Hapi from '@hapi/hapi';
import db from '../../config/db';

export default ({ getRequestFromId }) => async ({ params: { id } }: Hapi.Request, h: Hapi.ResponseToolkit) => {
  try {
    const request = await getRequestFromId(db, id);

    return request;
  } catch (err) {
    return h.response(err.message || 'Cannot find requests').code(404);
  }
}
