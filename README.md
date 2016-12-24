# Even faster React/Redux development

## Installation

```
npm i --save koiki
```

## Usage

### koiki.server / koiki.client
|Parameter     |Type             |Meaning                        |Place to specify |Remark  |
|:-------------|:----------------|:------------------------------|:----------------|:-------|
|urls          |Object           |Resource URLs                  | client / server |        |
|reducers      |Object           |Reducers                       | client / server |        |
|routes        |Object           |Routes                         | client / server |        |
|isDevelopment |Boolean          |Development Flag (For webpack) | server |        |
|app           |Object           |Instance of express            | server          |        |
|path          |String           |Root URI                       | server          |        |
|origin        |String           |App origin URL                 | server          |        |
|i18ndir       |String           |i18n properties directory path | server          |        |
|handlers      |Object           |-                              | server          |        |
|handlers.error|Function         |Error callback                 | server          |        |

### koiki.fetcher

### Breaking change
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
