Even faster React/Redux development

# Installation

```
npm i --save koiki
```

# Usage

## koiki.server / koiki.client
|Parameter     |Type             |Meaning                        |Place to specify |Remark  |
|:-------------|:----------------|:------------------------------|:----------------|:-------|
|urls          |Object           |Resource URLs                  | client / server |        |
|reducers      |Object           |Reducers                       | client / server |        |
|routes        |Object           |Routes                         | client / server |        |
|isDevelopment |Boolean          |Development Flag (For debug)   | client / server |        |
|manifest      |Object           |Extend manifest.json setting   | server          |        |
|app           |Object           |Instance of express            | server          |        |
|path          |String           |Root URI                       | server          |        |
|origin        |String           |Origin URL                     | server          |        |
|i18ndir       |String           |i18n properties directory path | server          |        |
|handlers      |Object           |-                              | server          |        |
|handlers.error|Function         |Error callback                 | server          |        |

## How to apply Authentication?
```
import { passporter } from 'koiki';
import express from 'express';

const app = express();
passporter.use({
  github: {
    appId: 'PLEASE SET GITHUB API CLIENT ID',
    secret: 'PLEASE SET GITHUB API SECRET ID',
  }
}, app, originUrl);
```

## How to fetch resources?
#### Define URLs in urls.js
```
{
  person: {
    gets: {
      method: 'GET',
      url: 'https://chaus.herokuapp.com/apis/koiki/people'
    },
    create: {
      method: 'POST',
      url: 'https://chaus.herokuapp.com/apis/koiki/people'      
    }
  }
}
```
First layer property will be use as of `person` resource.
Second layer property will be use as of `gets` action. ( action name will be captalized )

#### You can call `fetcher.person.gets` from asyncConnect or containers context.
Then result will be call with actions below.
- When resource start to fetch call 'person/GETS_START' action
- When getting resource has been succeeded, 'person/GETS_SUCCESS' action.
- When getting resource has been failed, 'person/GETS_FAILED' action.

Example below.
```
fetcher.person.gets({
  age: 25
});
```
fetcher will be response Promise object. So you can do like this.
```
fetcher.person.save({
  name: 'foo'
  age: 25
}).then(
  () => fetcher.person.gets()
);
```

#### Setup reducer to set onto store.

Responsed object can get from action.body.
action.res has Fetch API's responsed object.
```
export default function reducer(state = initialState, action = {}) {
  ...
  case GETS_SUCCESS:
    return {
      ...state,
      loading: false,
      loaded: true,
      items: action.body.items
    };
  ...
```


### Advanced Usage

You can write after / override / next properties under urls object to customize fetcher logic.


#### next

When resource has hypermedia link, we can call `fetcher.person.gets.next()` to get next items.

#### Set next method under urls third layer
```
{
  person: {
    gets: {
      method: 'GET',
      url: 'https://chaus.herokuapp.com/apis/koiki/people',

      /* If API response next paging resource such as
       * {
       *   paging: {
       *     next: 'https://....'
       *   }
       * }
      */
      next: action => action.body.paging.next
    },
  },
  ...
}
```

#### We can use `fetcher.person.gets.next` after called `fetcher.person.gets` on containers.


## Breaking change
v6.0.0
- Add Authentication feature

v5.0.0
- Update webpack version to 2
- bin/server.js, config for webpack directory no longer used anymore.
- .babelrc, server.babel.js no longer used anymore.
- .koikirc can be use to override webpack settings.
- webpack dependencies does not installed app self
- Be able to inject environment values onto bundled file which started with KOIKI_ prefix. ( Keep it mind that the value will be public in browser side ). If it is only used in server side, do not add the prefix.

See below to know example
https://github.com/sideroad/floras/commit/68ee25cccdc94cc5bbb544d7f6e99842a6ff3300
https://github.com/sideroad/corkpin/commit/e5eeb7f46d6382dd27ce5622c2a60e0a01bc3194

v4.0.0
- fetcher callback object is deeper than before.
 - Before
   - `then` callback only get response JSON object.
   - `after` callback only get response JSON object.
   - success dispatched callback has action.res from response JSON object.
 - After
   - `then` callback gets { body: response JSON object, res: fetch response object }
   - `after` callback gets { body: response JSON object, res: fetch response object }
   - success dispatched callback has action.res from fetch response object.
   - success dispatched callback has action.body from response JSON object.
   - error dispatched callback has action.res from fetch response object.
   - error dispatched callback has action.body from response JSON object.
