// Copyright IBM Corp. 2014,2016. All Rights Reserved.
// Node module: loopback-datasource-juggler
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

var util = require('util');
var Connector = require('loopback-connector').Connector;
var crypto = require('crypto');

/**
 * Initialize the Notify connector against the given data source
 *
 * @param {DataSource} dataSource The loopback-datasource-juggler dataSource
 * @param {Function} [callback] The callback function
 */
exports.initialize = function initializeDataSource(dataSource, callback) {
  dataSource.connector = new Notify(null, dataSource.settings);
};

exports.Notify = Notify;

function Notify(m, settings) {
  settings = settings || {};
  this.notifyClient = settings.notifyClient
  if (m instanceof Notify) {
    this.isNotify = true;
    this.constructor.super_.call(this, 'notify', settings);
    this._models = m._models;
  } else {
    this.isNotify = false;
    this.constructor.super_.call(this, 'notify', settings);
  }
}

util.inherits(Notify, Connector);

Notify.prototype.getDefaultIdType = function() {
  return this.defaultIdType;
};

Notify.prototype.all = function all(model, filter, callback) {
  this.notifyClient.notifyServer({
    service: 'rest',
    method: 'find',
    data: {
      model: model,
      args: [
        filter
      ]
    }
  }, 1)
  .then(function (data){
    callback(null, data)
  }, function (err){
    callback(err)
  })
};

Notify.prototype.count = function count(model, callback, where) {
  this.notifyClient.notifyServer({
    service: 'rest',
    method: 'count',
    data: {
      model: model,
      args: [
        where
      ]
    }
  }, 1)
  .then(function (data){
    callback(null, data)
  }, function (err){
    callback(err)
  })
};

Notify.prototype.create = function create(model, data, callback) {
  this.notifyClient.notifyServer({
    service: 'rest',
    method: 'create',
    data: {
      model: model,
      args: [
        data
      ]
    }
  }, 1)
  .then(function (data){
    callback(null, data.id)
  }, function (err){
    callback(err)
  })
};

Notify.prototype.exists = function exists(model, id, callback) {
  console.log('exists', arguments)
  process.nextTick(function() { callback(null, false); }.bind(this));
};

Notify.prototype.save = function save(model, data, callback) {
  console.log('save', arguments)
  this.flush('save', data, callback);
};

Notify.prototype.update =
  Notify.prototype.updateAll = function updateAll(model, where, data, cb) {
    console.log('update', arguments)
    var count = 0;
    this.flush('update', { count: count }, cb);
  };

Notify.prototype.updateAttributes = function updateAttributes(model, id, data, cb) {
  console.log('updateAttributes', arguments)
  if (!id) {
    var err = new Error('You must provide an id when updating attributes!');
    if (cb) {
      return cb(err);
    } else {
      throw err;
    }
  }

  this.setIdValue(model, data, id);
  this.save(model, data, cb);
};

Notify.prototype.destroy = function destroy(model, id, callback) {
  this.flush('destroy', null, callback);
};

Notify.prototype.destroyAll = function destroyAll(model, where, callback) {
  console.log('destroyAll', arguments)
  this.notifyClient.notifyServer({
    service: 'rest',
    method: 'destroyAll',
    data: {
      model: model,
      args: [
        where
      ]
    }
  }, 1)
  .then(function (data){
    console.log(data)
    callback(null, data)
  }, function (err){
    callback(err)
  })
};


Notify.prototype.ping = noop
Notify.prototype.transaction = function () {
  throw new Error('not implemented');
};
function noop(cb) {
  cb()
}
