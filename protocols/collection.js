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
        update: pattern,
        data: data
      }, queryToCallback(callback));
    },
    fcall: function(name, args, pattern, callback){
      return this.query({
        call: name,
        args: args,
        pattern: pattern
      }, queryToCallback(callback));
    },
    find: function(pattern, limits, callback, callbackDone){
      var query;
      query = {
        find: pattern
      };
      if (limits) {
        query.limits = limits;
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
      var c, name, broadcast, parsePermissions, permissions, this$ = this;
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
      parsePermissions = function(permissions){
        var def, keys;
        if (permissions) {
          def = false;
        } else {
          def = true;
        }
        keys = {
          find: true,
          findOne: true,
          call: true,
          create: true,
          remove: true,
          update: true
        };
        return h.dictMap(keys, function(val, key){
          var permission, x;
          permission = permissions[key];
          switch (x = permission != null ? permission.constructor : void 8) {
          case undefined:
            return def;
          case Boolean:
            return permission;
          case Object:
            return h.dictMap(permission, function(value, key){
              if (key !== 'chew') {
                return v(value);
              } else {
                return value;
              }
            });
          }
        });
      };
      if (!(permissions = this.get('permissions'))) {
        console.warn("WARNING: no permissions for collection " + name);
      }
      this.permissions = parsePermissions(permissions);
      return this.when('parent', function(parent){
        return parent.parent.onQuery({
          collection: name
        }, function(msg, res, realm){
          var ref$;
          realm == null && (realm = {});
          if (msg.create) {
            return this$.applyPermission(this$.permissions.create, {
              create: msg.create,
              postCreate: {}
            }, realm, function(err, msg){
              var modelClass, newModel, this$ = this;
              if (err) {
                return res.end({
                  err: 'access denied to collection: ' + err
                });
              }
              modelClass = c.resolveModel(msg.create);
              newModel = new modelClass();
              return newModel.update(msg.create, realm, function(err, data){
                if (err) {
                  return callbackToQuery(res)(err);
                }
                newModel.set(msg.postCreate);
                return newModel.flush(callbackToQuery(res));
              });
            });
          }
          if (msg.remove) {
            return this$.applyPermission(this$.permissions.remove, msg, realm, function(err, msg){
              if (err) {
                return res.end({
                  err: 'access denied to collection: ' + err
                });
              }
              this$.log('remove', msg.remove);
              return c.removeModel(msg.remove, realm, callbackToQuery(res));
            });
          }
          if (msg.findOne) {
            return this$.applyPermission(this$.permissions.findOne, msg, realm, function(err, msg){
              if (err) {
                return res.end({
                  err: 'access denied to collection: ' + err
                });
              }
              this$.log('findOne', msg.findOne);
              return c.findModel(msg.findOne, function(err, model){
                if (err || !model) {
                  return callbackToQuery(res)(err);
                }
                return model.render(realm, callbackToQuery(res));
              });
            });
          }
          if (msg.call && ((ref$ = msg.pattern) != null ? ref$.constructor : void 8) === Object) {
            return this$.applyPermission(this$.permissions.call, msg, realm, function(err, msg){
              if (err) {
                return res.end({
                  err: 'access denied to collection: ' + err
                });
              }
              this$.log('call', msg, msg.call);
              return c.fcall(msg.call, msg.args || [], msg.pattern, realm, callbackToQuery(res), function(err, data){
                if (err != null && err.name) {
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
            return this$.applyPermission(this$.permissions.update, msg, realm, function(err, msg){
              var queue;
              if (err) {
                return res.end({
                  err: 'access denied to collection: ' + err
                });
              }
              this$.log('update', msg.update, msg.data);
              queue = new helpers.queue({
                size: 3
              });
              return c.findModels(msg.update, {}, function(err, model){
                return queue.push(model.id, function(callback){
                  var this$ = this;
                  return model.update(msg.data, realm, function(err, data){
                    if (err) {
                      return callback(err, data);
                    }
                    return model.flush(function(err, fdata){
                      var data;
                      if (!_.keys(data).length) {
                        data = undefined;
                      }
                      return callback(err, data);
                    });
                  });
                });
              }, function(){
                return queue.done(callbackToQuery(res));
              });
            });
          }
          if (msg.find) {
            return this$.applyPermission(this$.permissions.find, msg, realm, function(err, msg){
              var bucket, endCb;
              if (err) {
                return res.end({
                  err: 'access denied to collection: ' + err
                });
              }
              bucket = new helpers.parallelBucket();
              endCb = bucket.cb();
              this$.log('find', msg.find, msg.limits);
              c.findModels(msg.find, msg.limits || {}, function(err, model){
                var bucketCallback;
                bucketCallback = bucket.cb();
                return model.render(realm, function(err, data){
                  if (!err && !_.isEmpty(data)) {
                    res.write(data);
                  }
                  return bucketCallback();
                });
              }, function(err, data){
                return endCb();
              });
              return bucket.done(function(err, data){
                return res.end();
              });
            });
          }
          return res.end({
            err: 'wat'
          });
        });
      });
    },
    applyPermission: function(permission, msg, realm, cb){
      var waterfall, x, checkRealm, checkValue, checkChew;
      waterfall = {
        msg: msg
      };
      switch (x = permission != null ? permission.constructor : void 8) {
      case undefined:
        return cb("No permission");
      case Boolean:
        if (permission) {
          return cb(void 8, msg);
        } else {
          return cb("Explicitly Forbidden");
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
            return cb("Realm Access Denied");
          }
          return checkValue(msg, function(err, msg){
            if (err) {
              return cb("Value Access Denied");
            }
            return checkChew(msg, realm, function(err, msg){
              if (err) {
                return cb("Chew Access Denied");
              }
              return cb(void 8, msg);
            });
          });
        });
      }
    },
    applyPermission_: function(permissions, msg, realm, callback){
      permissions == null && (permissions = []);
      if (!permissions.length) {
        return callback("Access Denied");
      }
      return async.series(_.map(permissions, function(permission){
        return function(callback){
          return permission.matchMsg.feed(msg, function(err, msg){
            if (err) {
              return callback(null, err);
            }
            if (!permission.matchRealm) {
              return callback(msg);
            } else {
              return permission.matchRealm.feed(realm, function(err){
                if (err) {
                  return callback(null, err);
                } else {
                  return callback(msg);
                }
              });
            }
          });
        };
      }), function(data, err){
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
    initialize: function(){
      var this$ = this;
      return this.when('parent', function(parent){
        parent.on('connect', function(client){
          return client.addProtocol(new server({
            verbose: this$.verbose,
            core: this$,
            logger: this$.logger
          }));
        });
        return _.map(parent.clients, function(client, id){
          return client.addProtocol(new server({
            verbose: this$.verbose,
            core: this$,
            logger: this$.logger
          }));
        });
      });
    }
  });
}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2xlc2gvY29kaW5nL25vZGUvbHdlYjMvcHJvdG9jb2xzL2NvbGxlY3Rpb24ubHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7RUFDQSxDQUFFLENBQUEsQ0FBQSxDQUFFLFFBQVEsWUFBQTtFQUNaLFFBQVMsQ0FBQSxDQUFBLENBQUUsUUFBUSxjQUFBO0VBQ25CLENBQUUsQ0FBQSxDQUFBLENBQUUsT0FBUSxDQUFBLENBQUEsQ0FBRSxRQUFRLFNBQUE7RUFDdEIsS0FBTSxDQUFBLENBQUEsQ0FBRSxRQUFRLE9BQUE7RUFFaEIsZUFBZ0IsQ0FBQSxDQUFBLENBQUUsUUFBUSxrQkFBRDtFQUN6QixTQUFVLENBQUEsQ0FBQSxDQUFFLFFBQVEsbUJBQUQ7RUFBdUIsQ0FBRSxDQUFBLENBQUEsQ0FBRSxTQUFTLENBQUM7RUFFeEQsSUFBSyxDQUFBLENBQUEsQ0FBRSxRQUFRLFNBQUE7RUFDZixPQUFRLENBQUEsQ0FBQSxDQUFFLFFBQVEsV0FBQTtFQUNsQixLQUFNLENBQUEsQ0FBQSxDQUFFLFFBQVEsU0FBQTtFQUNoQixNQUFPLENBQUEsQ0FBQSxDQUFFLFFBQVEsUUFBQTtFQUNqQixtQkFBb0IsQ0FBQSxDQUFBLENBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUE7RUFFM0Msa0JBQW1CLENBQUEsQ0FBQSxDQUFFLElBQUksQ0FBQyxRQUFRLENBQUMsV0FBVyxJQUFJLENBQUMsV0FBVyxZQUFELEdBQzNEO0lBQUEsV0FBVyxRQUFBLENBQUE7YUFDVDtRQUFBLFlBQVksQ0FBQyxDQUFDLEtBQUssSUFBQyxDQUFBLFlBQVksSUFBYjtRQUNuQixhQUFhLElBQUMsQ0FBQTtNQURkOztFQURGLENBRDRDO0VBSzlDLGVBQWdCLENBQUEsQ0FBQSxDQUFFLEtBQUssQ0FBQztFQUN4QixlQUFnQixDQUFBLENBQUEsQ0FBRSxLQUFLLENBQUM7RUFFeEIsZ0JBQWlCLENBQUEsQ0FBQSxDQUFFLE9BQU8sQ0FBQyxnQkFBaUIsQ0FBQSxDQUFBLENBQUUs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QUcsUUFBUSxLQUFDLENBQUE7VUFBckMsQ0FBQSxDQUFYO1NBRGY7T0FKRjs7RUFQUixDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiI2F1dG9jb21waWxlXG5fID0gcmVxdWlyZSAndW5kZXJzY29yZSdcbkJhY2tib25lID0gcmVxdWlyZSAnYmFja2JvbmU0MDAwJ1xuaCA9IGhlbHBlcnMgPSByZXF1aXJlICdoZWxwZXJzJ1xuYXN5bmMgPSByZXF1aXJlICdhc3luYydcblxuc3Vic2NyaXB0aW9uTWFuID0gcmVxdWlyZSgnc3Vic2NyaXB0aW9ubWFuMicpXG52YWxpZGF0b3IgPSByZXF1aXJlKCd2YWxpZGF0b3IyLWV4dHJhcycpOyB2ID0gdmFsaWRhdG9yLnZcblxuY29yZSA9IHJlcXVpcmUgJy4uL2NvcmUnXG5jaGFubmVsID0gcmVxdWlyZSAnLi9jaGFubmVsJ1xucXVlcnkgPSByZXF1aXJlICcuL3F1ZXJ5J1xuY29sb3JzID0gcmVxdWlyZSAnY29sb3JzJ1xuY29sbGVjdGlvbkludGVyZmFjZSA9IGNvcmUuY29yZS5leHRlbmQ0MDAwIHt9XG5cbmNvbGxlY3Rpb25Qcm90b2NvbCA9IGNvcmUucHJvdG9jb2wuZXh0ZW5kNDAwMCBjb3JlLm1vdGhlclNoaXAoJ2NvbGxlY3Rpb24nKSxcbiAgZnVuY3Rpb25zOiAtPlxuICAgIGNvbGxlY3Rpb246IF8uYmluZCBAY29sbGVjdGlvbiwgQFxuICAgIGNvbGxlY3Rpb25zOiBAY29sbGVjdGlvbnNcblxuY2FsbGJhY2tUb1F1ZXJ5ID0gcXVlcnkuY2FsbGJhY2tUb1F1ZXJ5XG5xdWVyeVRvQ2FsbGJhY2sgPSBxdWVyeS5xdWVyeVRvQ2FsbGJhY2tcblxuY2xpZW50Q29sbGVjdGlvbiA9IGV4cG9ydHMuY2xpZW50Q29sbGVjdGlvbiA9IGNvbGxlY3Rpb25JbnRlcmZhY2UuZXh0ZW5kNDAwMCBkb1xuICBpbml0aWFsaXplOiAtPlxuICAgIGlmIEBnZXQoJ2F1dG9zdWJzY3JpYmUnKSBpc250IGZhbHNlXG4gICAgICBAcGFyZW50LnBhcmVudC5jaGFubmVsKEBnZXQoJ25hbWUnKSkuam9pbiAobXNnKSB+PiBAZXZlbnQgbXNnXG5cbiAgc3Vic2NyaWJlTW9kZWw6IChpZCxjYWxsYmFjaykgLT5cbiAgICBAcGFyZW50LnBhcmVudC5jaGFubmVsKEBnZXQoJ25hbWUnKSArIFwiOlwiICsgaWQpLmpvaW4gKG1zZykgLT4gY2FsbGJhY2sgbXNnXG4gICAgcmV0dXJuIH4+IEBwYXJlbnQucGFyZW50LmNoYW5uZWwoQGdldCgnbmFtZScpICsgXCI6XCIgKyBpZCkucGFydCgpXG5cbiAgcXVlcnk6IChtc2csY2FsbGJhY2spIC0+XG4gICAgbXNnLmNvbGxlY3Rpb24gPSBAZ2V0ICduYW1lJ1xuICAgIEBwYXJlbnQucGFyZW50LnF1ZXJ5IG1zZywgY2FsbGJhY2tcbiAgICBcbiAgY3JlYXRlOiAoZGF0YSxjYWxsYmFjaykgLT5cbiAgICBkZWxldGUgZGF0YS5fdFxuICAgIEBxdWVyeSB7IGNyZWF0ZTogZGF0YSB9LCBxdWVyeVRvQ2FsbGJhY2sgY2FsbGJhY2tcblxuICByZW1vdmU6IChwYXR0ZXJuLGNhbGxiYWNrKSAtPlxuICAgIEBxdWVyeSB7IHJlbW92ZTogcGF0dGVybiB9LCBxdWVyeVRvQ2FsbGJhY2sgY2FsbGJhY2tcblxuICBmaW5kT25lOiAocGF0dGVybixjYWxsYmFjaykgLT5cbiAgICBAcXVlcnkgeyBmaW5kT25lOiBwYXR0ZXJuIH0sIHF1ZXJ5VG9DYWxsYmFjayBjYWxsYmFja1xuXG4gIHVwZGF0ZTogKHBhdHRlcm4sZGF0YSxjYWxsYmFjaykgLT5cbiAgICBAcXVlcnkgeyB1cGRhdGU6IHBhdHRlcm4sIGRhdGE6IGRhdGEgfSwgcXVlcnlUb0NhbGxiYWNrIGNhbGxiYWNrXG5cbiAgZmNhbGw6IChuYW1lLCBhcmdzLCBwYXR0ZXJuLCBjYWxsYmFjaykgLT5cbiAgICBAcXVlcnkgeyBjYWxsOiBuYW1lLCBhcmdzOiBhcmdzLCBwYXR0ZXJuOiBwYXR0ZXJuIH0sIHF1ZXJ5VG9DYWxsYmFjayBjYWxsYmFja1xuXG4gIGZpbmQ6IChwYXR0ZXJuLGxpbWl0cyxjYWxsYmFjayxjYWxsYmFja0RvbmUpIC0+XG4gICAgcXVlcnkgPSB7IGZpbmQ6IHBhdHRlcm4gfVxuICAgIGlmIGxpbWl0cyB0aGVuIHF1ZXJ5LmxpbWl0cyA9IGxpbWl0c1xuXG4gICAgQHF1ZXJ5IHF1ZXJ5LCAobXNnLGVuZCkgLT5cbiAgICAgIGlmIGVuZCB0aGVuIHJldHVybiBoZWxwZXJzLmNiYyBjYWxsYmFja0RvbmUsIG51bGwsIGVuZFxuICAgICAgY2FsbGJhY2sgbnVsbCwgbXNnXG5cbmNsaWVudCA9IGV4cG9ydHMuY2xpZW50ID0gY29sbGVjdGlvblByb3RvY29sLmV4dGVuZDQwMDAgZG9cbiAgZGVmYXVsdHM6XG4gICAgbmFtZTogJ2NvbGxlY3Rpb25DbGllbnQnXG4gICAgY29sbGVjdGlvbkNsYXNzOiBjbGllbnRDb2xsZWN0aW9uXG4gIHJlcXVpcmVzOiBbIGNoYW5uZWwuY2xpZW50IF1cblxuXG5zZXJ2ZXJDb2xsZWN0aW9uID0gZXhwb3J0cy5zZXJ2ZXJDb2xsZWN0aW9uID0gY29sbGVjdGlvbkludGVyZmFjZS5leHRlbmQ0MDAwIGRvXG4gIGluaXRpYWxpemU6IC0+XG4gICAgYyA9IEBjID0gQGdldCAnY29sbGVjdGlvbidcbiAgICBAcGVybWlzc2lvbnMgPSB7fVxuXG4gICAgQHNldCBuYW1lOiAobmFtZSA9ICBjLmdldCgnbmFtZScpKVxuXG4gICAgYnJvYWRjYXN0ID0gQGdldCgnYnJvYWRjYXN0JylcbiAgICBpZiBicm9hZGNhc3QgaXMgdHJ1ZSBvciBicm9hZGNhc3QgaXMgJyonXG4gICAgICBicm9hZGNhc3QgPSB1cGRhdGU6IHRydWUsIHJlbW92ZTogdHJ1ZSwgY3JlYXRlOiB0cnVlXG5cbiAgICAjY29uc29sZS5sb2cgJ2hhaScsIG5hbWUsIGJyb2FkY2FzdFxuXG4gICAgaWYgYnJvYWRjYXN0XG4gICAgICBpZiBicm9hZGNhc3QudXBkYXRlXG4gICAgICAgIEBjLm9uICd1cGRhdGUnLCAoZGF0YSkgfj5cbiAgICAgICAgICBpZiBpZCA9IGRhdGEuaWQgdGhlbiBAcGFyZW50LnBhcmVudC5jaGFubmVsKG5hbWUgKyBcIjpcIiArIGlkKS5icm9hZGNhc3QgYWN0aW9uOiAndXBkYXRlJywgdXBkYXRlOiBkYXRhXG5cbiAgICAgIGlmIGJyb2FkY2FzdC5yZW1vdmVcbiAgICAgICAgQGMub24gJ3JlbW92ZScsIChkYXRhKSB+PiAjIHNob3VsZCBnZXQgUE9TVCBSRU1PVkUgZGF0YSBmcm9tIGV2ZW50LCBzbyB0aGF0IGl0IGNhbiB0cmFuc21pdCBpZHNcbiAgICAgICAgICBpZiBpZCA9IGRhdGEuaWRcbiAgICAgICAgICAgIEBwYXJlbnQucGFyZW50LmNoYW5uZWwobmFtZSArIFwiOlwiICsgaWQpLmJyb2FkY2FzdCBhY3Rpb246ICdyZW1vdmUnXG5cbiAgICAgIGlmIGJyb2FkY2FzdC5jcmVhdGVcbiAgICAgICAgQGMub24gJ2NyZWF0ZScsIChkYXRhKSB+PlxuICAgICAgICAgIEBwYXJlbnQucGFyZW50LmNoYW5uZWwobmFtZSkuYnJvYWRjYXN0IGFjdGlvbjogJ2NyZWF0ZScsIGNyZWF0ZTogZGF0YVxuXG5cbiAgICBwYXJzZVBlcm1pc3Npb25zID0gKHBlcm1pc3Npb25zKSAtPlxuICAgICAgaWYgcGVybWlzc2lvbnMgdGhlbiBkZWYgPSBmYWxzZSBlbHNlIGRlZiA9IHRydWVcbiAgICAgIFxuICAgICAga2V5cyA9IHsgK2ZpbmQsICtmaW5kT25lLCArY2FsbCwgK2NyZWF0ZSwgK3JlbW92ZSwgK3VwZGF0ZSB9XG5cbiAgICAgIGguZGljdE1hcCBrZXlzLCAodmFsLCBrZXkpIC0+XG4gICAgICAgIHBlcm1pc3Npb24gPSBwZXJtaXNzaW9uc1trZXldXG4gICAgICAgIHN3aXRjaCB4ID0gcGVybWlzc2lvbj9AQFxuICAgICAgICAgIHwgdW5kZWZpbmVkID0+IGRlZlxuICAgICAgICAgIHwgQm9vbGVhbiAgID0+IHBlcm1pc3Npb25cbiAgICAgICAgICB8IE9iamVjdCAgICA9PiBoLmRpY3RNYXAgcGVybWlzc2lvbiwgKHZhbHVlLCBrZXkpIC0+IGlmIGtleSBpc250ICdjaGV3JyB0aGVuIHYgdmFsdWUgZWxzZSB2YWx1ZSAgIyBpbnN0YW50aWF0ZSB2YWxpZGF0b3JzXG4gICAgICBcbiAgICBpZiBub3QgKHBlcm1pc3Npb25zID0gQGdldCAncGVybWlzc2lvbnMnKSB0aGVuIGNvbnNvbGUud2FybiBcIldBUk5JTkc6IG5vIHBlcm1pc3Npb25zIGZvciBjb2xsZWN0aW9uICN7IG5hbWUgfVwiXG4gICAgQHBlcm1pc3Npb25zID0gcGFyc2VQZXJtaXNzaW9ucyBwZXJtaXNzaW9uc1xuXG4gICAgQHdoZW4gJ3BhcmVudCcsIChwYXJlbnQpIH4+XG4gICAgICBwYXJlbnQucGFyZW50Lm9uUXVlcnkgeyBjb2xsZWN0aW9uOiBuYW1lIH0sIChtc2csIHJlcywgcmVhbG09e30pIH4+XG5cbiAgICAgICAgaWYgbXNnLmNyZWF0ZVxuICAgICAgICAgIHJldHVybiBAYXBwbHlQZXJtaXNzaW9uIEBwZXJtaXNzaW9ucy5jcmVhdGUsIHsgY3JlYXRlOiBtc2cuY3JlYXRlLCBwb3N0Q3JlYXRlOiB7fSB9LCByZWFsbSwgKGVyciwgbXNnKSAtPlxuICAgICAgICAgICAgaWYgZXJyIHRoZW4gcmV0dXJuIHJlcy5lbmQgZXJyOiAnYWNjZXNzIGRlbmllZCB0byBjb2xsZWN0aW9uOiAnICsgZXJyXG4gICAgICAgICAgICBtb2RlbENsYXNzID0gYy5yZXNvbHZlTW9kZWwgbXNnLmNyZWF0ZVxuICAgICAgICAgICAgbmV3TW9kZWwgPSBuZXcgbW9kZWxDbGFzcygpXG5cbiAgICAgICAgICAgIG5ld01vZGVsLnVwZGF0ZSBtc2cuY3JlYXRlLCByZWFsbSwgKGVycixkYXRhKSB+PlxuICAgICAgICAgICAgICBpZiBlcnIgdGhlbiByZXR1cm4gY2FsbGJhY2tUb1F1ZXJ5KHJlcykoZXJyKVxuICAgICAgICAgICAgICBuZXdNb2RlbC5zZXQgbXNnLnBvc3RDcmVhdGVcbiAgICAgICAgICAgICAgbmV3TW9kZWwuZmx1c2ggY2FsbGJhY2tUb1F1ZXJ5KHJlcylcbiAgICAgICAgICAgIFxuICAgICAgICBpZiBtc2cucmVtb3ZlXG4gICAgICAgICAgcmV0dXJuIEBhcHBseVBlcm1pc3Npb24gQHBlcm1pc3Npb25zLnJlbW92ZSwgbXNnLCByZWFsbSwgKGVycixtc2cpIH4+XG4gICAgICAgICAgICBpZiBlcnIgdGhlbiByZXR1cm4gcmVzLmVuZCBlcnI6ICdhY2Nlc3MgZGVuaWVkIHRvIGNvbGxlY3Rpb246ICcgKyBlcnJcbiAgICAgICAgICAgIEBsb2cgJ3JlbW92ZScsIG1zZy5yZW1vdmVcbiAgICAgICAgICAgIGMucmVtb3ZlTW9kZWwgbXNnLnJlbW92ZSwgcmVhbG0sIGNhbGxiYWNrVG9RdWVyeShyZXMpXG5cbiAgICAgICAgaWYgbXNnLmZpbmRPbmVcbiAgICAgICAgICByZXR1cm4gQGFwcGx5UGVybWlzc2lvbiBAcGVybWlzc2lvbnMuZmluZE9uZSwgbXNnLCByZWFsbSwgKGVycixtc2cpIH4+XG4gICAgICAgICAgICBpZiBlcnIgdGhlbiByZXR1cm4gcmVzLmVuZCBlcnI6ICdhY2Nlc3MgZGVuaWVkIHRvIGNvbGxlY3Rpb246ICcgKyBlcnJcbiAgICAgICAgICAgIEBsb2cgJ2ZpbmRPbmUnLCBtc2cuZmluZE9uZVxuICAgICAgICAgICAgYy5maW5kTW9kZWwgbXNnLmZpbmRPbmUsIChlcnIsbW9kZWwpIC0+XG4gICAgICAgICAgICAgICAgaWYgZXJyIG9yIG5vdCBtb2RlbCB0aGVuIHJldHVybiBjYWxsYmFja1RvUXVlcnkocmVzKShlcnIpXG4gICAgICAgICAgICAgICAgbW9kZWwucmVuZGVyIHJlYWxtLCBjYWxsYmFja1RvUXVlcnkocmVzKVxuXG5cbiAgICAgICAgaWYgbXNnLmNhbGwgYW5kIG1zZy5wYXR0ZXJuPy5jb25zdHJ1Y3RvciBpcyBPYmplY3RcbiAgICAgICAgICByZXR1cm4gQGFwcGx5UGVybWlzc2lvbiBAcGVybWlzc2lvbnMuY2FsbCwgbXNnLCByZWFsbSwgKGVycixtc2cpIH4+XG4gICAgICAgICAgICBpZiBlcnIgdGhlbiByZXR1cm4gcmVzLmVuZCBlcnI6ICdhY2Nlc3MgZGVuaWVkIHRvIGNvbGxlY3Rpb246ICcgKyBlcnJcbiAgICAgICAgICAgIEBsb2cgJ2NhbGwnLCBtc2csIG1zZy5jYWxsXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGMuZmNhbGwgbXNnLmNhbGwsIChtc2cuYXJncyBvciBbXSksIG1zZy5wYXR0ZXJuLCByZWFsbSwgY2FsbGJhY2tUb1F1ZXJ5KHJlcyksIChlcnIsZGF0YSkgLT5cbiAgICAgICAgICAgICAgaWYgZXJyP25hbWUgdGhlbiBlcnIgPSBlcnIubmFtZVxuICAgICAgICAgICAgICByZXMuZW5kIGVycjogZXJyLCBkYXRhOiBkYXRhXG5cbiAgICAgICAgaWYgbXNnLnVwZGF0ZSBhbmQgbXNnLmRhdGFcbiAgICAgICAgICByZXR1cm4gQGFwcGx5UGVybWlzc2lvbiBAcGVybWlzc2lvbnMudXBkYXRlLCBtc2csIHJlYWxtLCAoZXJyLG1zZykgfj5cbiAgICAgICAgICAgIGlmIGVyclxuICAgICAgICAgICAgICAjQGxvZyAndXBkYXRlIGFjY2VzcyBkZW5pZWQgJyArIGVyciwgbXNnLCAnYWNjZXNzZGVuaWVkJywgJ2ZpbmQnXG4gICAgICAgICAgICAgIHJldHVybiByZXMuZW5kIGVycjogJ2FjY2VzcyBkZW5pZWQgdG8gY29sbGVjdGlvbjogJyArIGVyclxuICAgICAgICAgICAgQGxvZyAndXBkYXRlJywgbXNnLnVwZGF0ZSwgbXNnLmRhdGFcbiAgICAgICAgICAgIFxuIyAgICAgICAgICAgIGMudXBkYXRlTW9kZWwgbXNnLnVwZGF0ZSwgbXNnLmRhdGEsIHJlYWxtLCBjYWxsYmFja1RvUXVlcnkocmVzKVxuXG4gICAgICAgICAgICBxdWV1ZSA9IG5ldyBoZWxwZXJzLnF1ZXVlIHNpemU6IDNcblxuICAgICAgICAgICAgYy5maW5kTW9kZWxzIG1zZy51cGRhdGUsIHt9LCAoKGVycixtb2RlbCkgLT5cbiAgICAgICAgICAgICAgcXVldWUucHVzaCBtb2RlbC5pZCwgKGNhbGxiYWNrKSAtPlxuICAgICAgICAgICAgICAgIG1vZGVsLnVwZGF0ZSBtc2cuZGF0YSwgcmVhbG0sIChlcnIsZGF0YSkgfj5cbiAgICAgICAgICAgICAgICAgIGlmIGVyciB0aGVuIHJldHVybiBjYWxsYmFjayBlcnIsIGRhdGFcbiAgICAgICAgICAgICAgICAgIG1vZGVsLmZsdXNoIChlcnIsZmRhdGEpIC0+XG4gICAgICAgICAgICAgICAgICAgIGlmIG5vdCBfLmtleXMoZGF0YSkubGVuZ3RoIHRoZW4gZGF0YSA9IHVuZGVmaW5lZFxuICAgICAgICAgICAgICAgICAgICBjYWxsYmFjayBlcnIsZGF0YSksXG4gICAgICAgICAgICAgIC0+IHF1ZXVlLmRvbmUgY2FsbGJhY2tUb1F1ZXJ5KHJlcylcblxuXG4gICAgICAgIGlmIG1zZy5maW5kXG4gICAgICAgICAgcmV0dXJuIEBhcHBseVBlcm1pc3Npb24gQHBlcm1pc3Npb25zLmZpbmQsIG1zZywgcmVhbG0sIChlcnIsbXNnKSB+PlxuICAgICAgICAgICAgaWYgZXJyXG4gICAgICAgICAgICAgIHJldHVybiByZXMuZW5kIGVycjogJ2FjY2VzcyBkZW5pZWQgdG8gY29sbGVjdGlvbjogJyArIGVyclxuICAgICAgICAgICAgYnVja2V0ID0gbmV3IGhlbHBlcnMucGFyYWxsZWxCdWNrZXQoKVxuICAgICAgICAgICAgZW5kQ2IgPSBidWNrZXQuY2IoKVxuICAgICAgICAgICAgQGxvZyAnZmluZCcsIG1zZy5maW5kLCBtc2cubGltaXRzXG4gICAgICAgICAgICBjLmZpbmRNb2RlbHMgbXNnLmZpbmQsIChtc2cubGltaXRzIG9yIHt9KSwgKChlcnIsbW9kZWwpIC0+XG4gICAgICAgICAgICAgIGJ1Y2tldENhbGxiYWNrID0gYnVja2V0LmNiKClcbiAgICAgICAgICAgICAgbW9kZWwucmVuZGVyIHJlYWxtLCAoZXJyLGRhdGEpIC0+XG4gICAgICAgICAgICAgICAgaWYgbm90IGVyciBhbmQgbm90IF8uaXNFbXB0eShkYXRhKSB0aGVuIHJlcy53cml0ZSBkYXRhXG4gICAgICAgICAgICAgICAgI2lmIG1vZGVsLmFjdGl2ZSB0aGVuIG1vZGVsLmdDb2xsZWN0KClcbiAgICAgICAgICAgICAgICAjXG4gICAgICAgICAgICAgICAgYnVja2V0Q2FsbGJhY2soKSksICgoZXJyLGRhdGEpIC0+IGVuZENiKCkpXG4gICAgICAgICAgICBidWNrZXQuZG9uZSAoZXJyLGRhdGEpIC0+IHJlcy5lbmQoKVxuXG4gICAgICAgIHJlcy5lbmQgeyBlcnI6ICd3YXQnIH1cblxuICAgICAgICAjQGNvcmU/LmV2ZW50IG1zZy5wYXlsb2FkLCBtc2cuaWQsIHJlYWxtXG5cbiAgYXBwbHlQZXJtaXNzaW9uOiAocGVybWlzc2lvbiwgbXNnLCByZWFsbSwgY2IpIC0+XG4gICAgd2F0ZXJmYWxsID0geyBtc2c6IG1zZyB9XG4gICAgXG4gICAgc3dpdGNoIHggPSBwZXJtaXNzaW9uP0BAXG4gICAgICB8IHVuZGVmaW5lZCA9PiBjYiBcIk5vIHBlcm1pc3Npb25cIlxuICAgICAgfCBCb29sZWFuICAgPT5cbiAgICAgICAgaWYgcGVybWlzc2lvbiB0aGVuIGNiIHZvaWQsIG1zZ1xuICAgICAgICBlbHNlIGNiIFwiRXhwbGljaXRseSBGb3JiaWRkZW5cIlxuICAgICAgfCBPYmplY3QgICAgPT5cblxuICAgICAgICBjaGVja1JlYWxtID0gKHJlYWxtLCBjYikgLT5cbiAgICAgICAgICBpZiBwZXJtaXNzaW9uLnJlYWxtPyB0aGVuIHBlcm1pc3Npb24ucmVhbG0uZmVlZCByZWFsbSwgY2JcbiAgICAgICAgICBlbHNlIF8uZGVmZXIgY2JcblxuICAgICAgICBjaGVja1ZhbHVlID0gKG1zZywgY2IpIC0+IFxuICAgICAgICAgIGlmIHBlcm1pc3Npb24udmFsdWU/IHRoZW4gcGVybWlzc2lvbi52YWx1ZS5mZWVkIG1zZywgY2JcbiAgICAgICAgICBlbHNlIF8uZGVmZXIgLT4gY2Igdm9pZCwgbXNnXG5cbiAgICAgICAgY2hlY2tDaGV3ID0gKG1zZyxyZWFsbSwgY2IpIC0+IFxuICAgICAgICAgIGlmIHBlcm1pc3Npb24uY2hldz8gdGhlbiBwZXJtaXNzaW9uLmNoZXcgbXNnLCByZWFsbSwgY2JcbiAgICAgICAgICBlbHNlIF8uZGVmZXIgLT4gY2Igdm9pZCwgbXNnXG4gICAgICAgICAgXG4gICAgICAgIGNoZWNrUmVhbG0gcmVhbG0sIChlcnIsZGF0YSkgLT5cbiAgICAgICAgICBpZiBlcnIgdGhlbiByZXR1cm4gY2IgXCJSZWFsbSBBY2Nlc3MgRGVuaWVkXCJcbiAgICAgICAgICBjaGVja1ZhbHVlIG1zZywgKGVycixtc2cpIC0+XG4gICAgICAgICAgICBpZiBlcnIgdGhlbiByZXR1cm4gY2IgXCJWYWx1ZSBBY2Nlc3MgRGVuaWVkXCJcbiAgICAgICAgICAgIGNoZWNrQ2hldyBtc2csIHJlYWxtLCAoZXJyLG1zZykgLT5cbiAgICAgICAgICAgICAgaWYgZXJyIHRoZW4gcmV0dXJuIGNiIFwiQ2hldyBBY2Nlc3MgRGVuaWVkXCJcbiAgICAgICAgICAgICAgY2Igdm9pZCwgbXNnXG4gICAgICAgICAgICBcbiAgYXBwbHlQZXJtaXNzaW9uXzogKHBlcm1pc3Npb25zID0gW10sIG1zZywgcmVhbG0sIGNhbGxiYWNrKSAtPlxuICAgIGlmIG5vdCBwZXJtaXNzaW9ucy5sZW5ndGggdGhlbiByZXR1cm4gY2FsbGJhY2sgXCJBY2Nlc3MgRGVuaWVkXCJcbiAgICBhc3luYy5zZXJpZXMgXy5tYXAocGVybWlzc2lvbnMsIChwZXJtaXNzaW9uKSAtPlxuICAgICAgKGNhbGxiYWNrKSAtPlxuICAgICAgICBwZXJtaXNzaW9uLm1hdGNoTXNnLmZlZWQgbXNnLCAoZXJyLG1zZykgLT5cbiAgICAgICAgICBpZiBlcnIgdGhlbiByZXR1cm4gY2FsbGJhY2sgbnVsbCwgZXJyXG4gICAgICAgICAgaWYgbm90IHBlcm1pc3Npb24ubWF0Y2hSZWFsbSB0aGVuIGNhbGxiYWNrIG1zZ1xuICAgICAgICAgIGVsc2UgcGVybWlzc2lvbi5tYXRjaFJlYWxtLmZlZWQgcmVhbG0sIChlcnIpIC0+XG4gICAgICAgICAgICBpZiBlcnIgdGhlbiBjYWxsYmFjayBudWxsLCBlcnJcbiAgICAgICAgICAgIGVsc2UgY2FsbGJhY2sgbXNnKSxcbiAgICAgIChkYXRhLGVycikgLT5cbiAgICAgICAgaWYgZGF0YSB0aGVuIGNhbGxiYWNrIG51bGwsIGRhdGFcbiAgICAgICAgZWxzZSBjYWxsYmFjayB0cnVlLCBkYXRhXG5cbnNlcnZlciA9IGV4cG9ydHMuc2VydmVyID0gY29sbGVjdGlvblByb3RvY29sLmV4dGVuZDQwMDAgZG9cbiAgZGVmYXVsdHM6XG4gICAgbmFtZTogJ2NvbGxlY3Rpb25TZXJ2ZXInXG4gICAgY29sbGVjdGlvbkNsYXNzOiBzZXJ2ZXJDb2xsZWN0aW9uXG4gIHJlcXVpcmVzOiBbIGNoYW5uZWwuc2VydmVyIF1cblxuc2VydmVyU2VydmVyID0gZXhwb3J0cy5zZXJ2ZXJTZXJ2ZXIgPSBjb2xsZWN0aW9uUHJvdG9jb2wuZXh0ZW5kNDAwMCBkb1xuICBkZWZhdWx0czpcbiAgICBuYW1lOiAnY29sbGVjdGlvblNlcnZlclNlcnZlcidcbiAgICBjb2xsZWN0aW9uQ2xhc3M6IHNlcnZlckNvbGxlY3Rpb25cblxuICByZXF1aXJlczogWyBxdWVyeS5zZXJ2ZXJTZXJ2ZXIgXVxuXG4gIGluaXRpYWxpemU6IC0+XG4gICAgQHdoZW4gJ3BhcmVudCcsIChwYXJlbnQpIH4+XG4gICAgICBwYXJlbnQub24gJ2Nvbm5lY3QnLCAoY2xpZW50KSB+PlxuICAgICAgICBjbGllbnQuYWRkUHJvdG9jb2wgbmV3IHNlcnZlciB2ZXJib3NlOiBAdmVyYm9zZSwgY29yZTogQCwgbG9nZ2VyOiBAbG9nZ2VyXG5cbiAgICAgIF8ubWFwIHBhcmVudC5jbGllbnRzLCAoY2xpZW50LGlkKSB+PlxuICAgICAgICBjbGllbnQuYWRkUHJvdG9jb2wgbmV3IHNlcnZlciB2ZXJib3NlOiBAdmVyYm9zZSwgY29yZTogQCwgbG9nZ2VyOiBAbG9nZ2VyXG4iXX0=
