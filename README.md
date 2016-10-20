# sequelize-paginate-cursor 
[![npm](https://img.shields.io/npm/dm/sequelize-paginate-cursor.svg?maxAge=2592000)](https://www.npmjs.com/package/sequelize-paginate-cursor)
[![License](https://img.shields.io/npm/l/sequelize-paginate-cursor.svg?maxAge=2592000?style=plastic)](https://github.com/mirabalj/sequelize-paginate-cursor/blob/master/license)

## Installation

`npm install sequelize-paginate-cursor`

## Usage
```js
var Sequelize = require('sequelize');
var sequelizePagination = require('sequelize-paginate-cursor');

var Model = sequelize.define('user', {
  name: {
    type: Sequelize.STRING,
    field: 'first_name',
  },
}, {
  timestamps: false, // Not timestamps
  freezeTableName: true, // Model tableName will be the same as the model name
});
sequelizePagination(Model, { name: 'paged' }); // custom name, default 'paginate'

var paged = await Model.paginate({
  sinceId, // from what value to get documents (default: null)
  maxId, // to what value to get documents (default: null)
  limit, //amount of documents to get on search (default: 1)
  select, //what values get on request
  where, // query to match the search
  include, // property to establish relationships
  subQuery, // set top level options (default: true)
  keyPaginated, //key to paginate on document (ejm: 'count' ) (default: 'id')
  reverse, //tell the pagination to reverse the search
});

paged.objects // objects found
paged.nextCursor // the key value of the next cursor
```
`.paginate()` returns a promise, or can be used with a callback
`.paginate({},callback)`

## Features to have
- [ ] Map: *let the user map the documents*
- [ ] QueryMap: *let the user map the query to add chain calls*
- [ ] Filter: *filter documents and search more to reach the limit*
- [ ] beforeCursor: *cursor for before request*

### License: MIT
