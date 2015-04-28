// Generated by CoffeeScript 1.9.1
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
    initialize: function() {
      var channelClass;
      this.http = this.get('http');
      channelClass = exports.engineIoChannel.extend4000(this.get('channelClass') || this.channelClass || {});
      this.engineIo = engineio.attach(this.http);
      this.engineIo.on('connection', (function(_this) {
        return function(engineIoClient) {
          var channel, name;
          _this.log('connection received', name = engineIoClient.id, engineIoClient.request.socket.remoteAddress, engineIoClient.request.headers);
          channel = new channelClass({
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
      return this.engineIo.on('close', (function(_this) {
        return function(engineIoClient) {
          delete _this.clients[channel.get('name')];
          return _this.trigger('disconnect', channel);
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
