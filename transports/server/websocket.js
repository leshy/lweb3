// Generated by CoffeeScript 1.7.1
(function() {
  var Backbone, core, helpers, io, subscriptionMan, v, validator, webSocketServer, _;

  _ = require('underscore');

  Backbone = require('backbone4000');

  helpers = require('helpers');

  subscriptionMan = require('subscriptionman2');

  validator = require('validator2-extras');

  v = validator.v;

  io = require('socket.io');

  core = require('../../core');

  _.extend(exports, require('../websocket'));

  webSocketServer = exports.webSocketServer = core.server.extend4000(validator.ValidatedModel, {
    validator: {
      http: 'Instance'
    },
    defaults: {
      name: 'webSocketServer'
    },
    initialize: function() {
      var channelClass;
      this.http = this.get('http');
      channelClass = exports.webSocketChannel.extend4000(this.get('channelClass') || this.channelClass || {});
      this.socketIo = io.listen(this.http, {
        log: false
      });
      this.socketIo.on('connection', (function(_this) {
        return function(socketIoClient) {
          var channel, name;
          _this.log('connection received', name = socketIoClient.id);
          channel = new channelClass({
            parent: _this,
            socketIo: socketIoClient,
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
      return this.socketIo.on('disconnect', (function(_this) {
        return function(socketIoClient) {
          delete _this.clients[channel.get('name')];
          return _this.trigger('disconnect', channel);
        };
      })(this));
    },
    end: function() {
      this.http.close();
      return core.core.prototype.end.call(this);
    }
  });

}).call(this);
