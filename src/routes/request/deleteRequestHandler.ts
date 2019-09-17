import Hapi from '@hapi/hapi';
import db from '../../config/db';

export default ({ deleteRequest }) => async ({ params: { id } }: Hapi.Request, h: Hapi.ResponseToolkit) => {
  try {
    const { success } = await deleteRequest(db, id);
    return { success };
  } catch (err) {
    if (err.message === 'Request not found in database') {
      return h.response(err.message).code(404);
    }
    return h.response(err.message || 'Cannot delete request').code(400);
  }
};
