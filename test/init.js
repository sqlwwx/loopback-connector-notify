// Copyright IBM Corp. 2013,2016. All Rights Reserved.
// Node module: loopback-connector-mongodb
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

module.exports = require('should');

var Memory = require('loopback-datasource-juggler/lib/connectors/memory').Memory;
var DataSource = require('loopback-datasource-juggler').DataSource;

var TEST_ENV = process.env.TEST_ENV || 'test';

var ds = new DataSource({
  connector: 'memory',
})
ds.createModel('User', {
  seq: {type: Number, index: true},
  name: {type: String, index: true, sort: true},
  email: {type: String, index: true},
  birthday: {type: Date, index: true},
  role: {type: String, index: true},
  order: {type: Number, index: true, sort: true},
  vip: {type: Boolean}
});
ds.createModel('Widget', {id: { type: Number, id: true},name: String})
ds.createModel('Item', {id: { type: Number, id: true }, name: String})
var Nested = ds.createModel('Nested', {});
ds.createModel('Model', {
  str: String,
  date: Date,
  num: Number,
  bool: Boolean,
  list: {type: [String]},
  arr: Array,
  nested: Nested
});
ds.createModel('myModel', {
  list: { type: ['object'] }
});

var config = {
    notifyClient: {
      notifyServer(data) {
        return new Promise(function(resolve, reject) {
          if (data.service === 'rest') {
            // method create, update, find, deleteById
            var Model = ds.models[data.data.model]
            var method = data.method
            if (['create', 'update', 'count', 'find', 'destroyAll'].indexOf(method) !== -1) {
              Model[method](data.data.args[0], data.data.args[1], function(err, result) {
                if (err) {
                  return reject(err)
                } else {
                  return resolve(result)
                }
              })
            } else if (['deleteById'].indexOf(method) !== -1) {
              Model[method](data.data.args[0], function(err, result) {
                if (err) {
                  return Promise.reject(err)
                } else {
                  return Promise.resolve(result)
                }
              })
            } else {
              reject()
            }
          } else {
            reject()
          }
        })
      }
    }
};


global.config = config;

global.getDataSource = global.getSchema = function(customConfig) {
  customConfig = customConfig || config
  customConfig.notifyClient = customConfig.notifyClient || config.notifyClient
  var db = new DataSource(require('../'), customConfig);
  db.log = function(a) {
    console.log(a);
  };

  return db;
};

global.sinon = require('sinon');
