import 'dotenv/config';
import Hapi from '@hapi/hapi';

import routes from '../../routes';

const {
  API_PORT,
  API_PORT_TEST,
  API_HOST,
  NODE_ENV,
} = process.env;

interface IServerConfig {
  host?: string;
  port: number;
}

class HapiServer {
  private server: Hapi.Server;

  public constructor({ port, host }: IServerConfig) {
    try {
      this.server = new Hapi.Server({
        port,
        host,
        router: { stripTrailingSlash: true },
        routes: {
          cors: {
            origin: ['*'],
            credentials: true,
            headers: [
              'Access-Control-Allow-Origin',
              'Access-Control-Allow-Headers',
              'Accept',
              'Authorization',
              'Content-Type',
            ],
          },
        },
      });
    } catch ({ message }) {
      console.error(message);
      process.exit(1);
    }
  }

  private loadGoodReporterPlugin = async (): Promise<void> => {
    await this.server.register({
      plugin: require('@hapi/good'),
      options: {
        ops: { interval: 1000 },
        reporters: {
          myConsoleReporter: [
            {
              module: '@hapi/good-squeeze',
              name: 'Squeeze',
              args: [{
                log: '*',
                ...(NODE_ENV !== 'test' ? { response: '*' } : {}),
                error: '*',
                request: '*',
              }],
            }, {
              module: '@hapi/good-console',
            },
            'stdout',
          ],
        },
      },
    });
  }

  private loadPlugins = async (): Promise<void[]> => Promise.all([
    this.loadGoodReporterPlugin(),
  ]);

  private loadRoutes = (routes: Hapi.ServerRoute[]): void => {
    routes.forEach(r => this.server.route(r));
  }

  public start = async (): Promise<Hapi.Server> => {
    try {
      await this.loadPlugins();
      this.loadRoutes(routes);

      await this.server.start();

      if (NODE_ENV !== 'test') {
        const { port, protocol, address } = this.server.info;

        console.info(`[Hapi] Running at ${protocol}://${address}:${port}`);
      }

      return this.server;
    } catch (error) {
      console.error(error);
      process.exit(1);
    }
  }

  public stop = async (): Promise<void> => {
    try {
      return this.server.stop();
    } catch (error) {
      console.error(error);
      process.exit(1);
    }
  }
}

export default new HapiServer({
  host: API_HOST,
  port: Number(NODE_ENV === 'test' ? API_PORT_TEST : API_PORT),
});
