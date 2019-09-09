import 'dotenv/config';
import Hapi from '@hapi/hapi';
import HapiServer from './config/server';

const main = async (): Promise<Hapi.Server> => {
  // Link connections for utils functions
  return HapiServer.start();
};

main();

export default main;
