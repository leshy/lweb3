// Generated by CoffeeScript 1.8.0
(function() {
  var Backbone, channel, core, helpers, motherShip, protocol, protocolHost, server, startTime, subscriptionMan, v, validator, _,
    __slice = [].slice;

  _ = require('underscore');

  Backbone = require('backbone4000');

  helpers = require('helpers');

  subscriptionMan = require('subscriptionman2');

  validator = require('validator2-extras');

  v = validator.v;

  startTime = new Date().getTime();

  core = exports.core = subscriptionMan.fancy.extend4000({
    initialize: function() {
      this.verbose = this.get('verbose') || false;
      return this.when('parent', (function(_this) {
        return function(parent) {
          var _ref;
          _this.parent = parent;
          return _this.verbose = _this.get('verbose') || ((_ref = _this.parent) != null ? _ref.verbose : void 0) || false;
        };
      })(this));
    },
    name: function() {
      if (this.parent) {
        return this.parent.name() + "-" + this.get('name');
      } else {
        return this.get('name') || 'noname';
      }
    },
    end: function() {
      if (this.ended) {
        return;
      } else {
        this.ended = true;
      }
      this.log('ending');
      return this.trigger('end');
    },
    log: function() {
      var args;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      this.trigger('log', args);
      if (this.verbose) {
        return console.log.apply(console, [].concat('::', new Date().getTime() - startTime, this.name(), args));
      }
    }
  });

  protocolHost = exports.protocolHost = core.extend4000({
    initialize: function() {
      return this.protocols = {};
    },
    hasProtocol: function(protocol) {
      if (typeof protocol === 'function') {
        return Boolean(this[protocol.prototype.defaults.name]);
      }
      if (typeof protocol === 'object') {
        return Boolean(this[protocol.name()]);
      }
      throw "what is this?";
    },
    addProtocol: function(protocol) {
      var name;
      if (!(name = protocol.name())) {
        throw "what is this?";
      }
      if (this.hasProtocol(protocol)) {
        return;
      }
      _.map(protocol.requires, (function(_this) {
        return function(dependancyProtocol) {
          if (!_this.hasProtocol(dependancyProtocol)) {
            return _this.addProtocol(new dependancyProtocol());
          }
        };
      })(this));
      this[name] = protocol;
      protocol.set({
        parent: this
      });
      if (protocol.functions) {
        return _.extend(this, protocol.functions());
      }
    }
  });

  channel = exports.channel = protocolHost.extend4000({
    send: function(msg) {
      throw 'not implemented';
    }
  });

  protocol = exports.protocol = core.extend4000({
    requires: []
  });

  server = exports.server = protocolHost.extend4000({
    initialize: function() {
      return this.clients = this.children = {};
    }
  });

  motherShip = exports.motherShip = function(name) {
    var model;
    model = {};
    model.initialize = function() {
      return this[name + "s"] = {};
    };
    model[name] = function(instanceName, attributes) {
      var instance, instanceClass;
      if (attributes == null) {
        attributes = {};
      }
      if (instance = this[name + "s"][instanceName]) {
        return instance;
      }
      instanceClass = this.get(name + "Class");
      if (!instanceClass) {
        throw "I don't have " + name + "Class defined";
      }
      instance = this[name + "s"][instanceName] = new instanceClass(_.extend({
        parent: this,
        name: instanceName
      }, attributes));
      instance.once('end', (function(_this) {
        return function() {
          return delete _this[name + "s"][instanceName];
        };
      })(this));
      this.trigger('new' + helpers.capitalize(name), instance);
      return instance;
    };
    return Backbone.Model.extend4000(model);
  };

}).call(this);
