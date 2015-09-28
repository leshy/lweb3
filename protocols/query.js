// Generated by CoffeeScript 1.9.3
(function() {
  var Backbone, _, callbackToQuery, client, core, helpers, query, queryToCallback, reply, server, serverServer, subscriptionMan, util, v, validator;

  _ = require('underscore');

  Backbone = require('backbone4000');

  helpers = require('helpers');

  subscriptionMan = require('subscriptionman2');

  validator = require('validator2-extras');

  v = validator.v;

  core = require('../core');

  util = require('util');

  query = core.core.extend4000({
    end: function() {
      this.get('unsubscribe')();
      return this.parent.endQuery(this.id);
    }
  });

  queryToCallback = exports.queryToCallback = function(callback) {
    return function(msg, end) {
      return callback(msg.err, msg.data);
    };
  };

  callbackToQuery = exports.callbackToQuery = function(res) {
    return function(err, data) {
      if (err) {
        err = String(err);
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

  client = exports.client = core.protocol.extend4000(validator.ValidatedModel, {
    validator: {
      timeout: v().Default(3000).Number()
    },
    defaults: {
      name: 'queryClient'
    },
    functions: function() {
      return {
        query: _.bind(this.send, this)
      };
    },
    initialize: function() {
      return this.when('parent', (function(_this) {
        return function(parent) {
          parent.subscribe({
            type: 'reply',
            id: String
          }, function(msg) {
            if (msg.end) {
              _this.log('Q completed', msg.payload, 'q-' + msg.id);
            } else {
              _this.log('Q reply', msg.payload, 'q-' + msg.id);
            }
            return _this.event(msg);
          });
          return parent.on('end', function() {
            return _this.end();
          });
        };
      })(this));
    },
    endQuery: function(id) {
      this.log('canceling Q' + ' ' + id);
      return this.parent.send({
        type: 'queryCancel',
        id: id
      });
    },
    send: function(msg, timeout, callback) {
      var id, q, unsubscribe;
      if ((timeout != null ? timeout.constructor : void 0) === Function) {
        callback = timeout;
        timeout = this.get('timeout');
      }
      this.parent.send({
        type: 'query',
        id: id = helpers.uuid(10),
        payload: msg
      });
      this.log('Q starting', msg, 'q-' + id);
      q = new query({
        parent: this,
        id: id
      });
      q.set({
        unsubscribe: unsubscribe = this.subscribe({
          type: 'reply',
          id: id
        }, (function(_this) {
          return function(msg) {
            q.trigger('msg', msg.payload, msg.end);
            if (msg.end) {
              unsubscribe();
              q.trigger('end', msg.payload);
            }
            return helpers.cbc(callback, msg.payload, msg.end);
          };
        })(this))
      });
      return q;
    }
  });

  reply = core.core.extend4000({
    initialize: function() {
      this.set({
        name: this.get('id')
      });
      this.unsubscribe = this.parent.parent.subscribe({
        type: 'queryCancel',
        id: this.get('id')
      }, (function(_this) {
        return function() {
          _this.log('got query cancel request');
          return _this.cancel();
        };
      })(this));
      return this.parent.on('end', (function(_this) {
        return function() {
          return _this.cancel();
        };
      })(this));
    },
    write: function(msg) {
      if (this.ended) {
        return false;
      }
      this.parent.send(msg, this.id, false);
      return true;
    },
    end: function(msg) {
      if (!this.ended) {
        this.ended = true;
      } else {
        console.error("this reply has ended");
        return;
      }
      this.unsubscribe();
      this.parent.send(msg, this.id, true);
      return this.trigger('end');
    },
    cancel: function() {
      this.ended = true;
      this.unsubscribe();
      this.trigger('cancel');
      return this.trigger('end');
    }
  });

  serverServer = exports.serverServer = core.protocol.extend4000({
    defaults: {
      name: 'queryServerServer'
    },
    functions: function() {
      return {
        onQuery: _.bind(this.subscribe, this),
        onQueryWait: _.bind(this.subscribeWait, this),
        onQueryOnce: _.bind(this.subscribeOnce, this),
        onQueryError: (function(_this) {
          return function(callback) {
            return _this.on('error', callback);
          };
        })(this)
      };
    },
    subscribe: function(pattern, callback) {
      return subscriptionMan.fancy.prototype.subscribe.call(this, pattern, (function(_this) {
        return function(payload, id, realm) {
          var error, r;
          r = new reply({
            id: id,
            parent: realm.client.queryServer,
            realm: realm
          });
          try {
            return callback(payload, r, realm);
          } catch (_error) {
            error = _error;
            return _this.trigger("error", payload, r, realm, error, pattern);
          }
        };
      })(this));
    },
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
    },
    channel: function(channel) {
      return channel.addProtocol(new server({
        verbose: this.get('verbose')
      }));
    }
  });

  server = exports.server = core.protocol.extend4000({
    defaults: {
      name: 'queryServer'
    },
    functions: function() {
      return {
        onQuery: _.bind(this.subscribe, this)
      };
    },
    initialize: function() {
      this.when('core', (function(_this) {
        return function(core) {
          return _this.core = core;
        };
      })(this));
      return this.when('parent', (function(_this) {
        return function(parent) {
          parent.subscribe({
            type: 'query',
            payload: true
          }, function(msg, realm) {
            var ref;
            _this.log('query receive ' + util.inspect(msg.payload, {
              depth: 0
            }), {
              payload: msg.payload
            }, 'q-' + msg.id);
            _this.event(msg.payload, msg.id, realm);
            return (ref = _this.core) != null ? ref.event(msg.payload, msg.id, realm) : void 0;
          });
          return parent.on('end', function() {
            return _this.end();
          });
        };
      })(this));
    },
    send: function(payload, id, end) {
      var msg;
      if (end == null) {
        end = false;
      }
      msg = {
        type: 'reply',
        payload: payload,
        id: id
      };
      if (end) {
        msg.end = true;
        this.log('query end ' + util.inspect(payload, {
          depth: 0
        }), {
          payload: payload
        }, 'q-' + id);
      } else {
        this.log('query reply ' + util.inspect(payload, {
          depth: 0
        }), {
          payload: payload
        }, 'q-' + id);
      }
      return this.parent.send(msg);
    },
    subscribe: function(pattern, callback) {
      if (pattern == null) {
        pattern = true;
      }
      return subscriptionMan.fancy.prototype.subscribe.call(this, pattern, (function(_this) {
        return function(payload, id, realm) {
          return callback(payload, new reply({
            id: id,
            parent: _this,
            realm: realm
          }), realm);
        };
      })(this));
    }
  });

}).call(this);
