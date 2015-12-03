// Generated by CoffeeScript 1.9.3
(function() {
  var Backbone, _, core, helpers, nssocket, nssocketServer, subscriptionMan, v, validator;

  _ = require('underscore');

  Backbone = require('backbone4000');

  helpers = require('helpers');

  subscriptionMan = require('subscriptionman2');

  validator = require('validator2-extras');

  v = validator.v;

  nssocket = require('nssocket');

  core = require('../../core');

  _.extend(exports, require('../nssocket'));

  nssocketServer = exports.nssocketServer = core.server.extend4000(validator.ValidatedModel, {
    validator: {
      port: Number
    },
    defaults: {
      name: 'nssocketServer'
    },
    defaultChannelClass: exports.nssocketChannel,
    initialize: function() {
      var port;
      port = this.get('port');
      this.nssocket = nssocket.createServer((function(_this) {
        return function(clientSocket) {
          var channel;
          channel = new _this.channelClass({
            parent: _this,
            nssocket: clientSocket,
            name: 'ns-' + _this.channelName()
          });
          channel.log('connection received');
          return _this.receiveConnection(channel);
        };
      })(this));
      return this.nssocket.listen(this.get('port'));
    },
    end: function() {
      this.nssocket.disconnect();
      return core.core.prototype.end.call(this);
    }
  });

}).call(this);
