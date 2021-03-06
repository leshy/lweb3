// Generated by CoffeeScript 1.9.3
(function() {
  var Backbone, _, core, helpers, net, subscriptionMan, tcpServer, v, validator;

  _ = require('underscore');

  Backbone = require('backbone4000');

  helpers = require('helpers');

  subscriptionMan = require('subscriptionman2');

  validator = require('validator2-extras');

  v = validator.v;

  net = require('net');

  core = require('../../core');

  _.extend(exports, require('../tcp'));

  tcpServer = exports.tcpServer = core.server.extend4000(validator.ValidatedModel, {
    validator: {
      port: Number
    },
    defaults: {
      name: 'tcpServer'
    },
    defaultChannelClass: exports.tcpSocketChannel,
    initialize: function() {
      var idcounter, port;
      port = this.get('port');
      idcounter = 0;
      this.server = net.createServer({
        port: port
      }, (function(_this) {
        return function(socket) {
          var channel, name;
          name = ++idcounter;
          _this.log('connection received', idcounter);
          channel = new _this.channelClass({
            parent: _this,
            socket: socket,
            name: name
          });
          channel.on('change:name', function(model, newname) {
            delete _this.clients[name];
            _this.clients[newname] = model;
            return _this.trigger('connect:' + newname, model);
          });
          _this.clients[name] = channel;
          _this.trigger('connect:' + name, channel);
          _this.trigger('connect', channel);
          return channel.on('disconnect', function() {
            _this.log('connection lost', idcounter);
            delete _this.clients[channel.get('name')];
            return _this.trigger('disconnect', channel);
          });
        };
      })(this));
      return this.server.listen(port, '0.0.0.0');
    },
    end: function() {
      this.server.close();
      return core.core.prototype.end.call(this);
    }
  });

}).call(this);
