// Generated by LiveScript 1.4.0
(function(){
  var _, Backbone, h, helpers, async, subscriptionMan, validator, v, core, channel, query, colors, collectionInterface, collectionProtocol, callbackToQuery, queryToCallback, clientCollection, client, serverCollection, server, serverServer;
  _ = require('underscore');
  Backbone = require('backbone4000');
  h = helpers = require('helpers');
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
    functions: function(){
      return {
        collection: _.bind(this.collection, this),
        collections: this.collections
      };
    }
  });
  callbackToQuery = query.callbackToQuery;
  queryToCallback = query.queryToCallback;
  clientCollection = exports.clientCollection = collectionInterface.extend4000({
    initialize: function(){
      var this$ = this;
      if (this.get('autosubscribe') !== false) {
        return this.parent.parent.channel(this.get('name')).join(function(msg){
          return this$.event(msg);
        });
      }
    },
    subscribeModel: function(id, callback){
      var this$ = this;
      this.parent.parent.channel(this.get('name') + ":" + id).join(function(msg){
        return callback(msg);
      });
      return function(){
        return this$.parent.parent.channel(this$.get('name') + ":" + id).part();
      };
    },
    query: function(msg, callback){
      msg.collection = this.get('name');
      return this.parent.parent.query(msg, callback);
    },
    create: function(data, callback){
      delete data._t;
      return this.query({
        create: data
      }, queryToCallback(callback));
    },
    remove: function(pattern, callback){
      return this.query({
        remove: pattern
      }, queryToCallback(callback));
    },
    findOne: function(pattern, callback){
      return this.query({
        findOne: pattern
      }, queryToCallback(callback));
    },
    update: function(pattern, data, callback){
      return this.query({
        update: {
          pattern: pattern,
          data: data
        }
      }, queryToCallback(callback));
    },
    fcall: function(name, args, pattern, callback){
      return this.query({
        call: {
          name: name,
          args: args,
          pattern: pattern
        }
      }, queryToCallback(callback));
    },
    find: function(pattern, limits, callback, callbackDone){
      var query;
      query = {
        find: {
          pattern: pattern
        }
      };
      if (limits) {
        query.find.limits = limits;
      }
      return this.query(query, function(msg, end){
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
    initialize: function(){
      var c, name, broadcast, this$ = this;
      c = this.c = this.get('collection');
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
      if (broadcast) {
        if (broadcast.update) {
          this.c.on('update', function(data){
            var id;
            if (id = data.id) {
              return this$.parent.parent.channel(name + ":" + id).broadcast({
                action: 'update',
                update: data
              });
            }
          });
        }
        if (broadcast.remove) {
          this.c.on('remove', function(data){
            var id;
            if (id = data.id) {
              return this$.parent.parent.channel(name + ":" + id).broadcast({
                action: 'remove'
              });
            }
          });
        }
        if (broadcast.create) {
          this.c.on('create', function(data){
            return this$.parent.parent.channel(name).broadcast({
              action: 'create',
              create: data
            });
          });
        }
      }
      return this.when('parent', function(parent){
        return parent.parent.onQuery({
          collection: name
        }, function(msg, res, realm){
          realm == null && (realm = {});
          if (msg.create) {
            c.rCreate(realm, msg.create, callbackToQuery(res));
          }
          if (msg.remove) {
            c.rRemove(realm, msg.remove, callbackToQuery(res));
          }
          if (msg.findOne) {
            c.rFindOne(realm, msg.findOne, callbackToQuery(res));
          }
          if (msg.call) {
            c.rCall(realm, msg.call, callbackToQuery(res));
          }
          if (msg.update) {
            c.rUpdate(realm, msg.update, callbackToQuery(res));
          }
          if (msg.find) {
            return c.rFind(realm, msg.find, function(err, data){
              return res.write(data);
            }, function(){
              return res.end();
            });
          }
        });
      });
    },
    applyPermission: function(permission, msg, realm, cb){
      var x, checkRealm, checkValue, checkChew;
      switch (x = permission != null ? permission.constructor : void 8) {
      case undefined:
        return cb("Access Denied - No Perm");
      case Boolean:
        if (permission) {
          return cb(void 8, msg);
        } else {
          return cb("Access Denied - Forbidden");
        }
        break;
      case Object:
        checkRealm = function(realm, cb){
          if (permission.realm != null) {
            return permission.realm.feed(realm, cb);
          } else {
            return _.defer(cb);
          }
        };
        checkValue = function(msg, cb){
          if (permission.value != null) {
            return permission.value.feed(msg, cb);
          } else {
            return _.defer(function(){
              return cb(void 8, msg);
            });
          }
        };
        checkChew = function(msg, realm, cb){
          if (permission.chew != null) {
            return permission.chew(msg, realm, cb);
          } else {
            return _.defer(function(){
              return cb(void 8, msg);
            });
          }
        };
        return checkRealm(realm, function(err, data){
          if (err) {
            return cb("Access Denied - Realm");
          }
          return checkValue(msg, function(err, msg){
            if (err) {
              return cb("Access Denied - Value");
            }
            return checkChew(msg, realm, function(err, msg){
              if (err) {
                return cb("Access Denied - Chew");
              }
              return cb(void 8, msg);
            });
          });
        });
      }
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
    }
  });
}).call(this);
