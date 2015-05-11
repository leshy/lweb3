// Generated by CoffeeScript 1.7.1
(function() {
  var Backbone, core, helpers, nssocketChannel, subscriptionMan, v, validator, _;

  _ = require('underscore');

  Backbone = require('backbone4000');

  helpers = require('helpers');

  subscriptionMan = require('subscriptionman2');

  validator = require('validator2-extras');

  v = validator.v;

  core = require('../core');

  nssocketChannel = exports.nssocketChannel = core.channel.extend4000({
    defaults: {
      name: 'nsSocket'
    },
    initialize: function() {
      this.when('nssocket', (function(_this) {
        return function(nssocket) {
          _this.nssocket = nssocket;
          _this.nssocket.data('msg', function(msg) {
            _this.log("<", msg);
            return _this.event(msg, _this.realm);
          });
          _this.nssocket.on('start', function() {
            return _this.trigger('connect');
          });
          return _this.nssocket.on('close', function() {
            return _this.trigger('disconnect');
          });
        };
      })(this));
      return this.when('parent', (function(_this) {
        return function(parent) {
          return _this.nssocket.on('msg', function(msg) {
            return parent.event(msg, _this.realm);
          });
        };
      })(this));
    },
    send: function(msg) {
      this.log(">", msg);
      return this.nssocket.send('msg', msg);
    }
  });

}).call(this);
