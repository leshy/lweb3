// Generated by CoffeeScript 1.9.1
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
      var realm;
      realm = {
        client: this
      };
      return this.when('engineIo', (function(_this) {
        return function(engineIo) {
          var id;
          _this.engineIo = engineIo;
          if (id = _this.engineIo.id) {
            _this.set({
              name: id
            });
          }
          _this.engineIo.on('message', function(msg) {
            msg = JSON.parse(msg);
            _this.log("<", msg);
            _this.event(msg, realm);
            return _this.trigger('msg', msg);
          });
          _this.engineIo.on('close', function() {
            _this.trigger('disconnect');
            _this.log("Lost Connection");
            return _this.end();
          });
          return _this.when('parent', function(parent) {
            parent.on('end', function() {
              return _this.end();
            });
            return _this.on('msg', function(msg) {
              return parent.event(msg, realm);
            });
          });
        };
      })(this));
    },
    send: function(msg) {
      this.log(">", msg);
      return this.engineIo.send(JSON.stringify(msg));
    }
  });

}).call(this);
