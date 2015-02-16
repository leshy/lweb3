// Generated by CoffeeScript 1.8.0
(function() {
  var Backbone, client, core, helpers, query, reply, server, serverServer, subscriptionMan, v, validator, _;

  _ = require('underscore');

  Backbone = require('backbone4000');

  helpers = require('helpers');

  subscriptionMan = require('subscriptionman2');

  validator = require('validator2-extras');

  v = validator.v;

  core = require('../core');

  query = core.core.extend4000({
    end: function() {
      this.get('unsubscribe')();
      return this.parent.endQuery(this.id);
    }
  });

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
              _this.log('query completed', msg.id, msg.payload);
            } else {
              _this.log('got query reply', msg.id, msg.payload);
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
      this.log('canceling query', id);
      return this.parent.send({
        type: 'queryCancel',
        id: id
      });
    },
    send: function(msg, timeout, callback) {
      var id, unsubscribe;
      if ((timeout != null ? timeout.constructor : void 0) === Function) {
        callback = timeout;
        timeout = this.get('timeout');
      }
      this.parent.send({
        type: 'query',
        id: id = helpers.uuid(10),
        payload: msg
      });
      this.log('querying', id, msg);
      unsubscribe = this.subscribe({
        type: 'reply',
        id: id
      }, (function(_this) {
        return function(msg) {
          if (msg.end) {
            unsubscribe();
          }
          return helpers.cbc(callback, msg.payload, msg.end);
        };
      })(this));
      return new query({
        parent: this,
        id: id,
        unsubscribe: unsubscribe
      });
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
        throw "this reply has ended";
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
        onQuery: _.bind(this.subscribe, this)
      };
    },
    subscribe: function(pattern, callback) {
      return subscriptionMan.fancy.prototype.subscribe.call(this, pattern, (function(_this) {
        return function(payload, id, realm) {
          return callback(payload, new reply({
            id: id,
            parent: realm.client.queryServer
          }), realm);
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
            var _ref;
            _this.log('got query', msg.id, msg.payload);
            _this.event(msg.payload, msg.id, realm);
            return (_ref = _this.core) != null ? _ref.event(msg.payload, msg.id, realm) : void 0;
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
        this.log('ending query', id, payload);
      } else {
        this.log('replying to query', id, payload);
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
            parent: _this
          }), realm);
        };
      })(this));
    }
  });

}).call(this);
