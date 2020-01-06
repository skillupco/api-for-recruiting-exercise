import Hapi from '@hapi/hapi';
import DB from '../../config/db';

export default ({ validateRequest, invalidateRequest, archiveRequest }, path) =>
  async ({ params: { id } }: Hapi.Request, h: Hapi.ResponseToolkit) => {
    try {
      const method = {
        'validate/': validateRequest,
        'invalidate/': invalidateRequest,
        'archive/': archiveRequest,
        'reopen/': validateRequest,
      }[path];

      const { success } = await method(DB, id as string);
      return { success };
    } catch (err) {
      if (err.message === 'Request not found in database') {
        return h.response(err.message).code(404);
      }

      return h.response(err.message || 'Cannot create request').code(400);
    }
  }
