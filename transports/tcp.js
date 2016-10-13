// Generated by CoffeeScript 1.9.3
(function() {
  var Backbone, _, core, helpers, subscriptionMan, tcpSocketChannel, v, validator;

  _ = require('underscore');

  Backbone = require('backbone4000');

  helpers = require('helpers');

  subscriptionMan = require('subscriptionman2');

  validator = require('validator2-extras');

  v = validator.v;

  core = require('../core');

  tcpSocketChannel = exports.tcpSocketChannel = core.channel.extend4000({
    defaults: {
      name: 'tcp'
    },
    initialize: function() {
      this.when('socket', (function(_this) {
        return function(socket) {
          _this.socket = socket;
          _this.socket.on('data', function(msg) {
            msg = JSON.parse(String(msg));
            _this.log("<", msg);
            _this.event(msg, _this.realm);
            return _this.trigger('msg', msg);
          });
          _this.socket.on('connect', function() {
            return _this.trigger('connect');
          });
          return _this.socket.on('end', function() {
            return _this.trigger('disconnect');
          });
        };
      })(this));
      return this.when('parent', (function(_this) {
        return function(parent) {
          return _this.on('msg', function(msg) {
            return parent.event(msg, _this.realm);
          });
        };
      })(this));
    },
    send: function(msg) {
      this.log(">", msg);
      return this.socket.write(JSON.stringify(msg));
    }
  });

}).call(this);
