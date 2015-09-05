// Generated by CoffeeScript 1.9.3
(function() {
  var Backbone, Nssocket, _, helpers, nssocketClient, subscriptionMan, v, validator;

  _ = require('underscore');

  Backbone = require('backbone4000');

  helpers = require('helpers');

  subscriptionMan = require('subscriptionman2');

  validator = require('validator2-extras');

  v = validator.v;

  Nssocket = require('nssocket');

  _.extend(exports, require('../nssocket'));

  nssocketClient = exports.nssocketClient = exports.nssocketChannel.extend4000({
    defaults: {
      name: 'nssocketClient'
    },
    initialize: function() {
      return this.connect();
    },
    connect: function() {
      var nssocket;
      if (this.nssocket) {
        this.nssocket.destroy();
      }
      this.set({
        nssocket: nssocket = Nssocket.NsSocket({
          reconnect: false,
          type: 'tcp4'
        })
      });
      return _.defer((function(_this) {
        return function() {
          return nssocket.connect(_this.get('host'), _this.get('port'));
        };
      })(this));
    }
  });

}).call(this);
