// Generated by CoffeeScript 1.7.1
(function() {
  var Backbone, client, core, helpers, server, subscriptionMan, v, validator, _;

  _ = require('underscore');

  Backbone = require('backbone4000');

  helpers = require('helpers');

  subscriptionMan = require('subscriptionman2');

  validator = require('validator2-extras');

  v = validator.v;

  core = require('../core');

  client = exports.client = core.protocol.extend4000({
    name: 'queryClient',
    send: function(msg, callback) {
      var id, unsubscribe;
      this.parent.send({
        type: 'query',
        id: id = helpers.uuid(10),
        payload: msg
      });
      return unsubscribe = this.parent.subscribe({
        type: 'reply',
        id: id
      }, function(msg) {
        if (msg.end) {
          unsubscribe();
        }
        return callback(msg.payload, msg.end);
      });
    }
  });

  server = exports.server = core.protocol.extend4000({
    name: 'queryServer',
    initialize: function() {
      return this.when('parent', (function(_this) {
        return function(parent) {
          console.log("initializing queryserver");
          return parent.subscribe({
            type: 'query',
            payload: true
          }, function(msg) {
            return _this.event(msg.payload);
          });
        };
      })(this));
    },
    subscribe: function(pattern, callback) {
      if (pattern == null) {
        pattern = true;
      }
    }
  });

}).call(this);
