# OAE Lambdas
This repo is the home of all Open and Accountable Elections lambdas. The current list of lambdas includes:
- orestarScraper (cron job)

## Background
This is a template for the Serverless Framework with typescript, eslint and jest.

This repository has common tools and configuration for working The Serverless Framework and Typescript with AWS.

Largely based of the repo [here](https://medium.com/@Michael_Timbs/getting-started-with-aws-serverless-typescript-8c172ccfec41).


### Serverless Plugins
- serverless-iam-roles-per-function
- serverless-offline

#### Lambda PowerTools
- @dazn/lambda-powertools-cloudwatchevents-client
- @dazn/lambda-powertools-correlation-ids
- @dazn/lambda-powertools-logger
- @dazn/lambda-powertools-pattern-basic
- @dazn/lambda-powertools-lambda-client

#### Linting
- eslint
- eslint-config-airbnb-base
- typescript-eslint
- eslint-plugin-import
- @typescript-eslint/eslint-plugin
- @typescript/eslint-parser
- eslint-import-resolver-alias
- eslint-plugin-module-resolver

#### Testing
- jest
- babel-jest
- @babel/core
- @babel/preset-env
- @babel/preset-typescript

A default test is included to verify that jest is configured correctly
```
describe('who tests the tests?', () => {
  it('can run a test', () => {
    expect.hasAssertions();
    expect(1).toBe(1);
  });
});
```

#### Module Aliasing
Everything comes configured out the box to leverage module aliasing. 3 example aliases have been preconfigured.

Aliases must be defined in webpack, tsconfig, and eslint

webpack:
```
resolve: {
  extensions: ['.mjs', '.json', '.ts'],
  symlinks: false,
  cacheWithContext: false,
  alias: {
    '@src': path.resolve(__dirname, './src'),
    '@services': path.resolve(__dirname, './services'),
    '@tests': path.resolve(__dirname, './tests'),
  },
},
```

tsconfig:
```
"paths": {
  "@src/*": ["src/*"],
  "@services/*": ["services/*"],
  "@tests/*": ["tests/*"]
}
```

eslint:
```
"settings": {
  "import/resolver": {
    "alias": {
      "map": [
        ["@src", "./src"],
        ["@tests", "./tests"],
        ["@services", "./services"]
      ],
      "extensions": [
        ".ts",
        ".js"
      ]
    }
  }
}
```
