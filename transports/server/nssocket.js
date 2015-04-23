// Generated by CoffeeScript 1.9.1
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
    initialize: function() {
      var channelClass, idcounter, port;
      port = this.get('port');
      idcounter = 0;
      channelClass = exports.nssocketChannel.extend4000(this.get('channelClass') || this.channelClass || {});
      this.nssocket = nssocket.createServer((function(_this) {
        return function(clientSocket) {
          var channel, name;
          name = ++idcounter;
          _this.log('connection received', idcounter);
          channel = new channelClass({
            parent: _this,
            nssocket: clientSocket,
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
            delete _this.clients[channel.get('name')];
            return _this.trigger('disconnect', channel);
          });
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
