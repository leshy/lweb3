// Generated by CoffeeScript 1.9.3
(function() {
  var Backbone, _, engineIoClient, engineio, helpers, subscriptionMan, v, validator;

  _ = require('underscore');

  Backbone = require('backbone4000');

  helpers = require('helpers');

  subscriptionMan = require('subscriptionman2');

  validator = require('validator2-extras');

  v = validator.v;

  engineio = require('engine.io-client');

  _.extend(exports, require('../engineio'));

  engineIoClient = exports.engineIoClient = exports.engineIoChannel.extend4000({
    defaults: {
      name: 'engineIoClient'
    },
    initialize: function() {
      this.set({
        engineIo: this.engineIo = engineio.Socket(this.get('host') || 'ws://' + (typeof window === "function" ? window(typeof location === "function" ? location(host) : void 0) : void 0))
      });
      return this.engineIo.on('open', (function(_this) {
        return function() {
          return _this.trigger('connect');
        };
      })(this));
    },
    end: function() {
      if (this.ended) {
        return;
      }
      this.ended = true;
      this.engineIo.close();
      if (typeof this.engineIo === "function") {
        this.engineIo(typeof transport === "function" ? transport(typeof pollXhr === "function" ? pollXhr(abort()) : void 0) : void 0);
      }
      if (typeof this.engineIo === "function") {
        this.engineIo(typeof transport === "function" ? transport(typeof sendXhr === "function" ? sendXhr(abort()) : void 0) : void 0);
      }
      return this.trigger('end');
    }
  });

}).call(this);
