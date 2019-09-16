# api-for-recruiting-exercise
This API is given to potential recruits so that they can create a little App as a display of their skills.

## How to run id
#### You need node 12 installed.
```
yarn install
yarn start
```

You can also run the tests with `yarn test` with the eventual `--verbose` for more details, and `-t describeYouWantToRun` to run one particular "describe" suite.
## Routes

### GET /request/{state}:
This route returns a list of the requests which state is equal to the one in the parameters.
This state can be `pending`, `validated` or `archived`.

The requests' format is:
```
interface IRequest {
  message: string;
  createdAt: number;
  id: string;
  state: string;
  user: {
    fullName: string;
    email: string;
    age: number;
    role: string;
  };
}

type Response = IRequest[];
```

#

### GET /request/action/{id}
This route takes a request's id in parameter, and return a request data that contain its details plus a list of available actions.

```
type TAction = 'delete' | 'archive' | 'reopen' | 'validate' | 'invalidate';

interface IRequestDetails extends IRequest {
  actions: TAction[];
}

type IResponse = IRequestDetails;

```

#

### PATCH /request/validate/{id}
### PATCH /request/invalidate/{id}
### PATCH /request/archive/{id}
### PATCH /request/reopen/{id}
### DELETE /request/{id}
These five routes all take a request's id in parameter, and return { success: true } upon success.
They modify the request state.

```
type TResponse = { success: true };
```
