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
