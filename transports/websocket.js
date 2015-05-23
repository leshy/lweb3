// Generated by CoffeeScript 1.7.1
(function() {
  var Backbone, core, helpers, subscriptionMan, util, v, validator, webSocketChannel, _;

  _ = require('underscore');

  Backbone = require('backbone4000');

  helpers = require('helpers');

  subscriptionMan = require('subscriptionman2');

  validator = require('validator2-extras');

  v = validator.v;

  util = require('util');

  core = require('../core');

  webSocketChannel = exports.webSocketChannel = core.channel.extend4000({
    defaults: {
      name: 'webSocket'
    },
    initialize: function() {
      return this.when('socketIo', (function(_this) {
        return function(socketIo) {
          var id;
          _this.socketIo = socketIo;
          if (id = _this.socketIo.id) {
            _this.set({
              name: id
            });
            _this.log.extendContext({
              tags: [id]
            });
          }
          _this.socketIo.on('msg', function(msg) {
            _this.log('< ' + util.inspect(msg, {
              depth: 0
            }), msg, 'in');
            _this.event(msg, _this.realm);
            return _this.trigger('msg', msg);
          });
          _this.socketIo.on('disconnect', function() {
            _this.trigger('disconnect');
            _this.log("Lost Connection");
            return _this.end();
          });
          return _this.when('parent', function(parent) {
            parent.on('end', function() {
              return _this.end();
            });
            return _this.on('msg', function(msg) {
              return parent.event(msg, _this.realm);
            });
          });
        };
      })(this));
    },
    send: function(msg) {
      var err;
      this.log("> " + util.inspect(msg, {
        depth: 0
      }), msg, "out");
      try {
        JSON.stringify(msg);
      } catch (_error) {
        err = _error;
        console.error("cannot stringify", util.inspect(msg, {
          depth: 4,
          colors: true
        }));
        throw err;
      }
      return this.socketIo.emit('msg', msg);
    }
  });

}).call(this);
