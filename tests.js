// Generated by CoffeeScript 1.7.1
(function() {
  var Client, Http, Server, express, gimmeEnv, helpers, port, v, validator;

  validator = require('validator2-extras');

  v = validator.v;

  Server = require('./transports/server/websocket');

  Client = require('./transports/client/websocket');

  helpers = require('helpers');

  express = require('express');

  Http = require('http');

  port = 8192;

  gimmeEnv = function(callback) {
    var app, http, lwebc, lwebs;
    app = express();
    app.configure(function() {
      app.set('view engine', 'ejs');
      app.use(express.favicon());
      app.use(express.bodyParser());
      app.use(express.methodOverride());
      app.use(express.cookieParser());
      app.use(app.router);
      return app.use(function(err, req, res, next) {
        return res.send(500, 'BOOOM!');
      });
    });
    http = Http.createServer(app);
    http.listen(++port);
    lwebs = new Server.webSocketServer({
      http: http
    });
    lwebc = new Client.webSocketClient({
      host: 'http://localhost:' + port
    });
    return lwebs.on('connect', function(s) {
      return callback(lwebs, s, lwebc, function(test) {
        return lwebs.stop(function() {
          return lwebc.stop(function() {
            return test.done();
          });
        });
      });
    });
  };

  exports.init = function(test) {
    return gimmeEnv(function() {
      return test.done();
    });
  };

  exports.ClientSend = function(test) {
    return gimmeEnv(function(lwebs, s, c, done) {
      s.subscribe({
        test: true
      }, function(msg) {
        return done(test);
      });
      return c.send({
        test: 1
      });
    });
  };

  exports.ServerSend = function(test) {
    return gimmeEnv(function(lwebs, s, c, done) {
      c.subscribe({
        test: true
      }, function(msg) {
        return done(test);
      });
      return s.send({
        test: 1
      });
    });
  };

  exports.QueryProtocol = function(test) {
    var query;
    query = require('./protocols/query');
    return gimmeEnv(function(lwebs, s, c, done) {
      var total;
      s.addProtocol(new query.server());
      c.addProtocol(new query.client());
      s.queryServer.subscribe({
        test: Number
      }, function(msg, reply) {
        reply.write({
          reply: msg.test + 3
        });
        return helpers.wait(100, function() {
          return reply.end({
            reply: msg.test + 2
          });
        });
      });
      total = 0;
      return c.queryClient.send({
        test: 7
      }, function(msg, end) {
        total += msg.reply;
        if (end) {
          test.equal(total, 19);
          return test.done();
        }
      });
    });
  };

  exports.QueryProtocolCancel = function(test) {
    var query;
    query = require('./protocols/query');
    return gimmeEnv(function(lwebs, s, c, done) {
      var total;
      s.addProtocol(new query.server());
      c.addProtocol(new query.client());
      s.queryServer.subscribe({
        test: Number
      }, function(msg, reply) {
        reply.write({
          reply: msg.test + 3
        });
        return helpers.wait(100, function() {
          return test.equal(reply.ended, true);
        });
      });
      total = 0;
      return query = c.queryClient.send({
        test: 7
      }, function(msg, end) {
        query.end();
        total += msg.reply;
        c.subscribe({
          type: 'reply',
          end: true
        }, function(msg) {
          return test.ok(false, "didnt cancel");
        });
        return helpers.wait(200, function() {
          return test.done();
        });
      });
    });
  };

  exports.ChannelProtocol = function(test) {
    var channel;
    channel = require('./protocols/channel');
    return gimmeEnv(function(lwebs, s, c, done) {
      s.addProtocol(new channel.server({
        verbose: true
      }));
      c.addProtocol(new channel.client({
        verbose: true
      }));
      return c.channelClient.join('testchannel', function(err, channel) {
        if (err) {
          return test.fail();
        }
        test.equal(channel, c.channelClient.channels.testchannel);
        console.log('joined!');
        channel.subscribe({
          test: 1
        }, function(msg) {
          test.equal(msg.bla, 3, "BLA ISNT 3");
          channel.part();
          s.channelServer.channels.testchannel.broadcast({
            test: 2,
            bla: 4
          });
          return helpers.wait(100, function() {
            return done(test);
          });
        });
        return s.channelServer.channel('testchannel').broadcast({
          test: 1,
          bla: 3
        });
      });
    });
  };

  exports.CollectionProtocol = function(test) {
    var collection;
    collection = require('./protocols/collection');
    return gimmeEnv(function(lwebs, s, c, done) {
      s.addProtocol(new collection.server({
        verbose: true,
        backend: new Mongo({
          db: db
        })
      }));
      c.addProtocol(new collection.client({
        verbose: true
      }));
      s.defineCollection('bla');
      c.defineCollection('bla');
      return c.collection.bla.findModels({}, {}, function(err, model) {
        return console.log(model);
      });
    });
  };

}).call(this);
