import Hapi from '@hapi/hapi';
import { INewRequestData } from '../../models/requests';
import db from '../../config/db';

export default ({ addRequest }) => async ({ payload }: Hapi.Request, h: Hapi.ResponseToolkit) => {
  try {
    const { id } = await addRequest(db, payload as INewRequestData);
    return { id };
  } catch (err) {
    return h.response(err.message || 'Cannot create request').code(400);
  }
}
