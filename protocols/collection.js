// Generated by CoffeeScript 1.9.1
(function() {
  var Backbone, _, async, channel, client, clientCollection, collectionInterface, collectionProtocol, colors, core, helpers, query, queryToCallback, server, serverCollection, serverServer, subscriptionMan, v, validator;

  _ = require('underscore');

  Backbone = require('backbone4000');

  helpers = require('helpers');

  async = require('async');

  subscriptionMan = require('subscriptionman2');

  validator = require('validator2-extras');

  v = validator.v;

  core = require('../core');

  channel = require('./channel');

  query = require('./query');

  colors = require('colors');

  collectionInterface = core.core.extend4000({});

  collectionProtocol = core.protocol.extend4000(core.motherShip('collection'), {
    functions: function() {
      return {
        collection: _.bind(this.collection, this),
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
    initialize: function() {
      if (this.get('autosubscribe') !== false) {
        return this.parent.parent.channel(this.get('name')).join((function(_this) {
          return function(msg) {
            return _this.event(msg);
          };
        })(this));
      }
    },
    subscribeModel: function(id, callback) {
      this.parent.parent.channel(this.get('name') + ":" + id).join(function(msg) {
        return callback(msg);
      });
      return (function(_this) {
        return function() {
          return _this.parent.parent.channel(_this.get('name') + ":" + id).part();
        };
      })(this);
    },
    query: function(msg, callback) {
      msg.collection = this.get('name');
      return this.parent.parent.query(msg, callback);
    },
    create: function(data, callback) {
      delete data._t;
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
      var broadcast, c, callbackToRes, msgTypes, name, permDef;
      c = this.c = this.get('collection');
      this.permissions = {};
      this.set({
        name: name = c.get('name')
      });
      broadcast = this.get('broadcast');
      if (broadcast === true || broadcast === '*') {
        broadcast = {
          update: true,
          remove: true,
          create: true
        };
      }
      console.log('hai', name, broadcast, this.get('broadcast'));
      if (broadcast) {
        if (broadcast.update) {
          this.c.on('update', (function(_this) {
            return function(data) {
              var id;
              if (id = data.id) {
                return _this.parent.parent.channel(_this.get('name') + ":" + id).broadcast({
                  action: 'update',
                  update: data
                });
              }
            };
          })(this));
        }
        if (broadcast.remove) {
          this.c.on('remove', (function(_this) {
            return function(data) {
              var id;
              if (id = data.id) {
                return _this.parent.parent.channel(_this.get('name') + ":" + id).broadcast({
                  action: 'remove'
                });
              }
            };
          })(this));
        }
        if (broadcast.create) {
          this.c.on('create', (function(_this) {
            return function(data) {
              return _this.parent.parent.channel(name).broadcast({
                action: 'create',
                create: data
              });
            };
          })(this));
        }
      }
      if (!(permDef = this.get('permissions'))) {
        console.warn("WARNING: no permissions for collection " + name + ", passing everything");
      } else {
        msgTypes = ['find', 'findOne', 'create', 'remove', 'update', 'call'];
        permDef(helpers.dictMap(msgTypes, (function(_this) {
          return function(val, msgType) {
            _this.permissions[msgType] = [];
            return function(matchMsg, matchRealm) {
              var permission;
              permission = {
                matchMsg: v(matchMsg)
              };
              if (matchRealm) {
                permission.matchRealm = v(matchRealm);
              }
              return _this.permissions[msgType].push(permission);
            };
          };
        })(this)));
      }
      callbackToRes = function(res) {
        return function(err, data) {
          if (err != null ? err.name : void 0) {
            err = err.name;
          }
          if (err) {
            return res.end({
              err: err
            });
          } else {
            return res.end({
              data: data
            });
          }
        };
      };
      return this.when('parent', (function(_this) {
        return function(parent) {
          return parent.parent.onQuery({
            collection: name
          }, function(msg, res, realm) {
            var ref;
            if (realm == null) {
              realm = {};
            }
            if (msg.create) {
              return _this.applyPermission(_this.permissions.create, msg, realm, function(err, msg) {
                if (err) {
                  return res.end({
                    err: 'access denied'
                  });
                }
                return c.createModel(msg.create, realm, callbackToRes(res));
              });
            }
            if (msg.remove) {
              return _this.applyPermission(_this.permissions.remove, msg, realm, function(err, msg) {
                if (err) {
                  return res.end({
                    err: 'access denied'
                  });
                }
                _this.log('remove', msg.remove);
                return c.removeModel(msg.remove, realm, callbackToRes(res));
              });
            }
            if (msg.findOne) {
              return _this.applyPermission(_this.permissions.findOne, msg, realm, function(err, msg) {
                if (err) {
                  return res.end({
                    err: 'access denied'
                  });
                }
                _this.log('findOne', msg.findOne);
                return c.findModel(msg.findOne, function(err, model) {
                  if (err) {
                    return callbackToRes(res)(err);
                  }
                  model.render(realm, callbackToRes(res));
                  if (model.gCollect) {
                    return model.gCollect();
                  }
                });
              });
            }
            if (msg.call && ((ref = msg.pattern) != null ? ref.constructor : void 0) === Object) {
              return _this.applyPermission(_this.permissions.call, msg, realm, function(err, msg) {
                if (err) {
                  return res.end({
                    err: 'access denied'
                  });
                }
                _this.log('call', msg.pattern, msg.call, msg.args);
                return c.fcall(msg.call, msg.args || [], msg.pattern, realm, callbackToRes(res), function(err, data) {
                  if (err != null ? err.name : void 0) {
                    err = err.name;
                  }
                  return res.end({
                    err: err,
                    data: data
                  });
                });
              });
            }
            if (msg.update && msg.data) {
              return _this.applyPermission(_this.permissions.update, msg, realm, function(err, msg) {
                if (err) {
                  return res.end({
                    err: 'access denied'
                  });
                }
                _this.log('update', msg.update, msg.data);
                return c.updateModel(msg.update, msg.data, realm, callbackToRes(res));
              });
            }
            if (msg.find) {
              return _this.applyPermission(_this.permissions.find, msg, realm, function(err, msg) {
                var bucket, endCb;
                if (err) {
                  return res.end({
                    err: 'access denied'
                  });
                }
                bucket = new helpers.parallelBucket();
                endCb = bucket.cb();
                _this.log('find', msg.find, msg.limits);
                c.findModels(msg.find, msg.limits || {}, (function(err, model) {
                  var bucketCallback;
                  bucketCallback = bucket.cb();
                  return model.render(realm, function(err, data) {
                    if (!err && !_.isEmpty(data)) {
                      res.write(data);
                    }
                    if (model.gCollect) {
                      model.gCollect();
                    }
                    return bucketCallback();
                  });
                }), (function(err, data) {
                  return endCb();
                }));
                return bucket.done(function(err, data) {
                  return res.end();
                });
              });
            }
            return res.end({
              err: 'wat'
            });
          });
        };
      })(this));
    },
    applyPermission: function(permissions, msg, realm, callback) {
      if (permissions == null) {
        permissions = [];
      }
      return async.series(_.map(permissions, function(permission) {
        return function(callback) {
          return permission.matchMsg.feed(msg, function(err, msg) {
            if (err) {
              return callback(null, err);
            }
            if (!permission.matchRealm) {
              return callback(msg);
            } else {
              return permission.matchRealm.feed(realm, function(err) {
                if (err) {
                  return callback(null, err);
                } else {
                  return callback(msg);
                }
              });
            }
          });
        };
      }), function(data, err) {
        if (data) {
          return callback(null, data);
        } else {
          return callback(true, data);
        }
      });
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
