(function(){
  var _, Backbone, helpers, subscriptionMan, validator, v, core, util, p, query, queryToCallback, callbackToQuery, client, reply, serverServer, server;
  _ = require('underscore');
  Backbone = require('backbone4000');
  helpers = require('helpers');
  subscriptionMan = require('subscriptionman2');
  validator = require('validator2-extras');
  v = validator.v;
  core = require('../core');
  util = require('util');
  p = require('bluebird');
  query = core.core.extend4000({
    end: function(){
      this.get('unsubscribe')();
      return this.parent.endQuery(this.id);
    }
  });
  queryToCallback = exports.queryToCallback = function(callback){
    return function(msg, end){
      return callback(msg.err, msg.data);
    };
  };
  callbackToQuery = exports.callbackToQuery = function(res){
    return function(err, data){
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
      timeout: v().Default(5000).Number()
    },
    defaults: {
      name: 'queryClient'
    },
    functions: function(){
      return {
        query: _.bind(this.send, this),
        queryP: _.bind(this.sendP, this),
        pquery: _.bind(this.sendP, this)
      };
    },
    initialize: function(){
      var this$ = this;
      return this.when('parent', function(parent){
        parent.subscribe({
          type: 'reply',
          id: String
        }, function(msg){
          if (msg.end) {
            this$.log('Q completed', msg.payload, 'q-' + msg.id);
          } else {
            this$.log('Q reply', msg.payload, 'q-' + msg.id);
          }
          return this$.event(msg);
        });
        return parent.once('end', function(){
          return this$.end();
        });
      });
    },
    endQuery: function(id){
      this.log('canceling Q' + ' ' + id);
      return this.parent.send({
        type: 'queryCancel',
        id: id
      });
    },
    sendP: function(msg){
      var this$ = this;
      return new p(function(resolve, reject){
        var ret, first;
        ret = [];
        first = true;
        return this$.send(msg, function(data, end){
          var first;
          if (first && end) {
            return resolve(data);
          }
          first = false;
          if (end) {
            if (data) {
              ret.push(data);
            }
            return resolve(ret);
          } else {
            return ret.push(data);
          }
        });
      });
    },
    send: function(msg, timeout, callback, callbackTimeout){
      var id, q, cancelTimeout, unsubscribe, this$ = this;
      if ((timeout != null ? timeout.constructor : void 8) === Function) {
        callbackTimeout = callback;
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
      cancelTimeout = void 8;
      q.set({
        unsubscribe: unsubscribe = this.subscribe({
          type: 'reply',
          id: id
        }, function(msg){
          if (cancelTimeout) {
            cancelTimeout();
            cancelTimeout = undefined;
          }
          q.trigger('msg', msg.payload, msg.end);
          if (msg.end) {
            unsubscribe();
            q.trigger('end', msg.payload);
          }
          return helpers.cbc(callback, msg.payload, msg.end);
        })
      });
      if (timeout) {
        cancelTimeout = helpers.wait(timeout, function(){
          this$.log('Q timeout', msg, 'q-' + id);
          unsubscribe();
          return helpers.cbc(callbackTimeout);
        });
      }
      return q;
    }
  });
  reply = core.core.extend4000({
    initialize: function(){
      var this$ = this;
      this.set({
        name: this.get('id')
      });
      this.unsubscribe = this.parent.parent.subscribe({
        type: 'queryCancel',
        id: this.get('id')
      }, function(){
        this$.log('got query cancel request');
        return this$.cancel();
      });
      return this.parent.on('end', function(){
        return this$.cancel();
      });
    },
    write: function(msg){
      if (this.ended) {
        return false;
      }
      this.parent.send(msg, this.id, false);
      return true;
    },
    end: function(msg){
      this.parent.send(msg, this.id, true);
      this.unsubscribe();
      return this.trigger('end');
    },
    cancel: function(){
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
    functions: function(){
      var this$ = this;
      return {
        onQuery: _.bind(this.subscribe, this),
        onQueryWait: _.bind(this.subscribeWait, this),
        onQueryOnce: _.bind(this.subscribeOnce, this),
        onQueryError: function(callback){
          return this$.on('error', callback);
        }
      };
    },
    subscribe: function(pattern, callback){
      var this$ = this;
      return subscriptionMan.fancy.prototype.subscribe.call(this, pattern, function(payload, id, realm){
        var r, error;
        r = new reply({
          id: id,
          parent: realm.client.queryServer,
          realm: realm
        });
        try {
          return callback(payload, r, realm);
        } catch (e$) {
          error = e$;
          return this$.trigger("error", payload, r, realm, error, pattern);
        }
      });
    },
    initialize: function(){
      var this$ = this;
      return this.when('parent', function(parent){
        parent.on('connect', function(client){
          return client.addProtocol(new server({
            verbose: this$.verbose,
            core: this$
          }));
        });
        return _.map(parent.clients, function(client, id){
          return client.addProtocol(new server({
            verbose: this$.verbose,
            core: this$
          }));
        });
      });
    },
    channel: function(channel){
      return channel.addProtocol(new server({
        verbose: this.get('verbose')
      }));
    }
  });
  server = exports.server = core.protocol.extend4000({
    defaults: {
      name: 'queryServer'
    },
    functions: function(){
      return {
        onQuery: _.bind(this.subscribe, this)
      };
    },
    initialize: function(){
      var this$ = this;
      this.when('core', function(core){
        return this$.core = core;
      });
      return this.when('parent', function(parent){
        parent.subscribe({
          type: 'query',
          payload: true
        }, function(msg, realm){
          var ref$;
          this$.log('query receive ' + util.inspect(msg.payload, {
            depth: 0
          }), {
            payload: msg.payload
          }, 'q-' + msg.id);
          this$.event(msg.payload, msg.id, realm);
          return (ref$ = this$.core) != null ? ref$.event(msg.payload, msg.id, realm) : void 8;
        });
        return parent.on('end', function(){
          return this$.end();
        });
      });
    },
    send: function(payload, id, end){
      var msg;
      end == null && (end = false);
      msg = {
        type: 'reply',
        payload: payload,
        id: id
      };
      if (end) {
        msg.end = true;
      } else {}
      return this.parent.send(msg);
    },
    subscribe: function(pattern, callback){
      var this$ = this;
      pattern == null && (pattern = true);
      return subscriptionMan.fancy.prototype.subscribe.call(this, pattern, function(payload, id, realm){
        return callback(payload, new reply({
          id: id,
          parent: this$,
          realm: realm
        }), realm);
      });
    }
  });
}).call(this);
