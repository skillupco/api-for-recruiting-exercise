import Good from '@hapi/good';

export default [
  ...(process.env.NODE_ENV !== 'test' ? [{
    plugin: Good,
    options: {
      ops: {
        interval: 1000,
      },
      reporters: {
        console: [
          {
            module: '@hapi/good-squeeze',
            name: 'Squeeze',
            args: [
              {
                log: '*',
                response: '*',
                error: '*',
                request: '*',
              },
            ],
          },
          {
            module: '@hapi/good-console',
          },
          'stdout',
        ],
      },
    },
  }] : []),
];
