// Generated by CoffeeScript 1.7.1
(function() {
  var Backbone, channel, client, clientCollection, collectionInterface, collectionProtocol, core, helpers, query, queryToCallback, server, serverCollection, serverServer, subscriptionMan, v, validator, _;

  _ = require('underscore');

  Backbone = require('backbone4000');

  helpers = require('helpers');

  subscriptionMan = require('subscriptionman2');

  validator = require('validator2-extras');

  v = validator.v;

  core = require('../core');

  channel = require('./channel');

  query = require('./query');

  collectionInterface = core.core.extend4000({});

  collectionProtocol = core.protocol.extend4000(core.motherShip('collection'), {
    functions: function() {
      return {
        collections: this.collections
      };
    }
  });

  queryToCallback = function(callback) {
    return function(msg, end) {
      return callback(msg.err, msg.data);
    };
  };

  clientCollection = exports.clientCollection = collectionInterface.extend4000({
    query: function(msg, callback) {
      msg.collection = this.get('name');
      return this.parent.parent.query(msg, callback);
    },
    create: function(data, callback) {
      this.log('create', data);
      return this.query({
        create: data
      }, queryToCallback(callback));
    },
    remove: function(pattern, callback) {
      return this.query({
        remove: pattern
      }, queryToCallback(callback));
    },
    findOne: function(pattern, callback) {
      return this.query({
        findOne: pattern
      }, queryToCallback(callback));
    },
    update: function(pattern, data, callback) {
      return this.query({
        update: pattern,
        data: data
      }, queryToCallback(callback));
    },
    fcall: function(name, args, pattern, callback) {
      return this.query({
        call: name,
        args: args,
        pattern: pattern
      }, queryToCallback(callback));
    },
    find: function(pattern, limits, callback, callbackDone) {
      query = {
        find: pattern
      };
      if (limits) {
        query.limits = limits;
      }
      return this.query(query, function(msg, end) {
        if (end) {
          return helpers.cbc(callbackDone, null, end);
        }
        return callback(null, msg);
      });
    }
  });

  client = exports.client = collectionProtocol.extend4000({
    defaults: {
      name: 'collectionClient',
      collectionClass: clientCollection
    },
    requires: [channel.client]
  });

  serverCollection = exports.serverCollection = collectionInterface.extend4000({
    initialize: function() {
      var c, callbackToRes, name;
      c = this.get('collection');
      this.set({
        name: name = c.get('name')
      });
      this.when('parent', (function(_this) {
        return function(parent) {
          return parent.parent.onQuery({
            collection: name
          }, function(msg, res, realm) {
            var _ref;
            if (realm == null) {
              realm = {};
            }
            _this.event(msg, res, realm);
            return (_ref = _this.core) != null ? _ref.event(msg.payload, msg.id, realm) : void 0;
          });
        };
      })(this));
      callbackToRes = function(res) {
        return function(err, data) {
          if (err != null ? err.name : void 0) {
            err = err.name;
          }
          return res.end({
            err: err,
            data: data
          });
        };
      };
      this.subscribe({
        create: Object
      }, function(msg, res, realm) {
        return c.createModel(msg.create, realm, callbackToRes(res));
      });
      this.subscribe({
        remove: Object
      }, function(msg, res, realm) {
        return c.removeModel(msg.remove, realm, callbackToRes(res));
      });
      this.subscribe({
        update: Object,
        data: Object
      }, function(msg, res, realm) {
        return c.updateModel(msg.update, msg.data, realm, callbackToRes(res));
      });
      this.subscribe({
        findOne: Object
      }, function(msg, res, realm) {
        return c.findModel(msg.findOne, function(err, model) {
          if (err) {
            return callbackToRes(res)(err);
          }
          return model.render(realm, callbackToRes(res));
        });
      });
      this.subscribe({
        call: String,
        pattern: Object,
        args: v()["default"]([]).Array()
      }, function(msg, res, realm) {
        return c.fcall(msg.call, msg.args, msg.pattern, realm, callbackToRes(res), function(err, data) {
          if (err != null ? err.name : void 0) {
            err = err.name;
          }
          return res.write({
            err: err,
            data: data
          });
        });
      });
      return this.subscribe({
        find: Object
      }, (function(_this) {
        return function(msg, res, realm) {
          var bucket, endCb;
          bucket = new helpers.parallelBucket();
          endCb = bucket.cb();
          c.findModels(msg.find, msg.limits || {}, (function(err, model) {
            var bucketCallback;
            bucketCallback = bucket.cb();
            return model.render(realm, function(err, data) {
              if (!err) {
                res.write(data);
              }
              return bucketCallback();
            });
          }), (function(err, data) {
            return endCb();
          }));
          return bucket.done(function(err, data) {
            return res.end();
          });
        };
      })(this));
    }
  });

  server = exports.server = collectionProtocol.extend4000({
    defaults: {
      name: 'collectionServer',
      collectionClass: serverCollection
    },
    requires: [channel.server]
  });

  serverServer = exports.serverServer = collectionProtocol.extend4000({
    defaults: {
      name: 'collectionServerServer',
      collectionClass: serverCollection
    },
    requires: [query.serverServer],
    initialize: function() {
      return this.when('parent', (function(_this) {
        return function(parent) {
          parent.on('connect', function(client) {
            return client.addProtocol(new server({
              verbose: _this.verbose,
              core: _this
            }));
          });
          return _.map(parent.clients, function(client, id) {
            return client.addProtocol(new server({
              verbose: _this.verbose,
              core: _this
            }));
          });
        };
      })(this));
    }
  });

}).call(this);
