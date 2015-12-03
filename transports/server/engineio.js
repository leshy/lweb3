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
      name: 'EIOServer'
    },
    defaultChannelClass: exports.engineIoChannel.extend4000({
      initialize: function() {
        return this.when('engineIo', (function(_this) {
          return function() {
            return typeof _this.logger === "function" ? _this.logger(addTags('ip-' + _this.ip())) : void 0;
          };
        })(this));
      },
      ip: function() {
        var ip, request;
        request = this.engineIo.request;
        ip = request.headers['x-real-ip'] || request.headers['x-forwarded-for'] || request.connection.remoteAddress;
        return _.last(ip.split(":"));
      }
    }),
    initialize: function() {
      this.http = this.get('http');
      this.engineIo = engineio.attach(this.http);
      return this.engineIo.on('connection', (function(_this) {
        return function(engineIoClient) {
          var channel;
          _this.receiveConnection(channel = new _this.channelClass({
            parent: _this,
            engineIo: engineIoClient,
            name: 'e-' + _this.channelName()
          }));
          return channel.log('Connection Received', {
            headers: engineIoClient.request.headers
          });
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
