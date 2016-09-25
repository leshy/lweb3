(function(){
  var util, ref$, flattenDeep, each, p, Backbone, subscriptionMan, core, query, validator, v, remoteObject, client, server, out$ = typeof exports != 'undefined' && exports || this, slice$ = [].slice;
  util = require('util');
  ref$ = require('leshdash'), flattenDeep = ref$.flattenDeep, each = ref$.each;
  p = require('bluebird');
  Backbone = require('backbone4000');
  subscriptionMan = require('subscriptionman2');
  core = require('../core');
  query = require('./query');
  validator = require('validator2-extras');
  v = validator.v;
  out$.remoteObject = remoteObject = (function(){
    remoteObject.displayName = 'remoteObject';
    var prototype = remoteObject.prototype, constructor = remoteObject;
    function remoteObject(parent, name, methods){
      var this$ = this;
      each(methods, function(method){
        return this$[method] = function(){
          var args;
          args = slice$.call(arguments);
          return parent.remoteCall(name, method, args);
        };
      });
    }
    return remoteObject;
  }());
  out$.client = client = core.protocol.extend4000({
    defaults: {
      name: 'rpcClient'
    },
    requires: [query.client],
    functions: function(){
      var this$ = this;
      return {
        remoteObject: function(){
          return this$.remoteObject.apply(this$, arguments);
        }
      };
    },
    remoteCall: function(name, method, args){
      var this$ = this;
      return new p(function(resolve, reject){
        return this$.parent.query({
          rpc: name,
          method: method,
          args: args
        }, function(msg, end){
          if (msg.err) {
            return reject(msg.err);
          } else {
            return resolve(msg.data);
          }
        });
      });
    },
    remoteObject: function(name){
      var methods;
      methods = slice$.call(arguments, 1);
      return new remoteObject(this, name, flattenDeep(methods));
    }
  });
  out$.server = server = core.protocol.extend4000({
    defaults: {
      name: 'rpcServer'
    },
    requires: [query.server],
    functions: function(){
      var this$ = this;
      return {
        exportObject: function(){
          return this$.remoteObject.apply(this$, arguments);
        }
      };
    },
    initialize: function(){
      var this$ = this;
      this.remoteObjects = {};
      return this.when('parent', function(parent){
        return parent.onQuery({
          rpc: String,
          method: String,
          args: Array
        }, function(msg, reply){
          var obj, res;
          if (!(obj = this$.remoteObjects[msg.rpc])) {
            return reply.end({
              err: 'not found'
            });
          }
          return res = obj[msg.method].apply(obj, msg.args).then(function(res){
            return reply.end({
              data: res
            });
          })['catch'](function(err){
            return reply.end({
              err: err
            });
          });
        });
      });
    },
    remoteObject: function(name, obj){
      return this.remoteObjects[name] = obj;
    }
  });
}).call(this);
