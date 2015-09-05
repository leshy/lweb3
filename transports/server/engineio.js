// Generated by CoffeeScript 1.9.3
(function() {
  var Backbone, _, core, engineIoServer, engineio, helpers, subscriptionMan, v, validator;

  _ = require('underscore');

  Backbone = require('backbone4000');

  helpers = require('helpers');

  subscriptionMan = require('subscriptionman2');

  validator = require('validator2-extras');

  v = validator.v;

  engineio = require('engine.io');

  core = require('../../core');

  _.extend(exports, require('../engineio'));

  engineIoServer = exports.engineIoServer = core.server.extend4000(validator.ValidatedModel, {
    validator: {
      http: 'Instance'
    },
    defaults: {
      name: 'engineIoServer'
    },
    defaultChannelClass: exports.engineIoChannel,
    initialize: function() {
      this.http = this.get('http');
      this.engineIo = engineio.attach(this.http);
      return this.engineIo.on('connection', (function(_this) {
        return function(engineIoClient) {
          var channel, ip, name;
          _this.log('connection received to ' + (name = engineIoClient.id), {
            ip: ip = engineIoClient.request.socket.remoteAddress,
            headers: engineIoClient.request.headers
          });
          channel = new _this.channelClass({
            parent: _this,
            engineIo: engineIoClient,
            name: name
          });
          channel.on('change:name', function(model, newname) {
            delete _this.clients[name];
            _this.clients[newname] = model;
            return _this.trigger('connect:' + newname, model);
          });
          _this.clients[name] = channel;
          _this.trigger('connect:' + name, channel);
          return _this.trigger('connect', channel);
        };
      })(this));
    },
    end: function() {
      if (this.ended) {
        return;
      }
      this.ended = true;
      this.http.close();
      return core.core.prototype.end.call(this);
    }
  });

}).call(this);
