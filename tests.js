// Generated by CoffeeScript 1.7.1
(function() {
  var Http, Server, express, gimmeEnv, helpers, port;

  Server = require('./transports/server/websocket');

  helpers = require('helpers');

  express = require('express');

  Http = require('http');

  port = 8192;

  gimmeEnv = function(callback) {
    var app, http, lwebs;
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
      http: http,
      channelClass: function() {
        return true;
      }
    });
    return helpers.wait(200, callback);
  };

  ({
    init: function(test) {
      return gimmeEnv(function() {
        return test.done();
      });
    }
  });

}).call(this);
