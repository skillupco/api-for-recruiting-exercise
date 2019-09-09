module.exports = {
  globals: {
    'ts-jest': {
      tsConfig: 'tsconfig.json',
    },
  },
  moduleFileExtensions: [
    'ts',
    'js',
    'json',
  ],
  transform: {
    '^.+\\.js?$': 'ts-jest',
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },
  testRegex: '__tests__/.*.spec.[jt
  ]s$',
  testPathIgnorePatterns: [
    '/(build|docs|node_modules)/',
  ],
  testEnvironment: 'node',
};
