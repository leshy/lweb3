// Generated by CoffeeScript 1.9.3
(function() {
  var Backbone, _, core, engineIoChannel, helpers, subscriptionMan, util, v, validator;

  _ = require('underscore');

  Backbone = require('backbone4000');

  helpers = require('helpers');

  subscriptionMan = require('subscriptionman2');

  validator = require('validator2-extras');

  v = validator.v;

  util = require('util');

  core = require('../core');

  engineIoChannel = exports.engineIoChannel = core.channel.extend4000({
    defaults: {
      name: 'engineIo'
    },
    initialize: function() {
      this.when('engineIo', (function(_this) {
        return function(engineIo) {
          _this.engineIo = engineIo;
          _this.engineIo.on('message', function(msg) {
            msg = JSON.parse(msg);
            _this.log('< ' + JSON.stringify(msg), msg, 'in');
            _this.event(msg, _this.realm);
            return _this.trigger('msg', msg);
          });
          return _this.engineIo.once('close', function() {
            _this.trigger('disconnect');
            _this.log("Lost Connection", {}, "disconnect");
            return _this.end();
          });
        };
      })(this));
      return this.when('parent', (function(_this) {
        return function(parent) {
          parent.on('end', function() {
            return _this.end();
          });
          return _this.on('msg', function(msg) {
            return parent.event(msg, _this.realm);
          });
        };
      })(this));
    },
    send: function(msg) {
      return this.engineIo.send(JSON.stringify(msg));
    }
  });

}).call(this);
