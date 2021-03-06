// Generated by CoffeeScript 1.9.1
(function() {
  var Backbone, _, helpers, io, subscriptionMan, v, validator, webSocketClient;

  _ = require('underscore');

  Backbone = require('backbone4000');

  helpers = require('helpers');

  subscriptionMan = require('subscriptionman2');

  validator = require('validator2-extras');

  v = validator.v;

  io = require('socket.io-client');

  _.extend(exports, require('../websocket'));

  webSocketClient = exports.webSocketClient = exports.webSocketChannel.extend4000({
    defaults: {
      name: 'webSocketClient'
    },
    initialize: function() {
      this.set({
        socketIo: this.socketIo = io.connect(this.get('host') || "http://" + (typeof window === "function" ? window(typeof location === "function" ? location(host, {
          log: false,
          reconnect: false
        }) : void 0) : void 0))
      });
      this.socketIo.on('connect', (function(_this) {
        return function() {
          return _this.trigger('connect');
        };
      })(this));
      return this.socketIo.on('disconnect', (function(_this) {
        return function() {
          return _this.trigger('disconnect');
        };
      })(this));
    },
    end: function() {
      if (this.ended) {
        return;
      }
      this.ended = true;
      this.socketIo.disconnect();
      return this.trigger('end');
    }
  });

}).call(this);
