// Generated by CoffeeScript 1.9.1
(function() {
  var Client, Http, Server, Test, colors, express, gimmeEnv, helpers, port, v, validator;

  validator = require('validator2-extras');

  v = validator.v;

  Server = require('./transports/server/websocket');

  Client = require('./transports/client/websocket');

  helpers = require('helpers');

  express = require('express');

  Http = require('http');

  port = 8192;

  colors = require('colors');

  gimmeEnv = function(callback) {
    var app, http, lwebc, lwebs;
    app = express();
    http = Http.createServer(app);
    http.listen(++port);
    lwebs = new Server.webSocketServer({
      http: http,
      verbose: false
    });
    lwebc = new Client.webSocketClient({
      host: 'http://localhost:' + port,
      verbose: false
    });
    return lwebs.on('connect', function(s) {
      return callback(lwebs, s, lwebc, function(test) {
        lwebc.end();
        return helpers.wait(30, function() {
          lwebs.end();
          return helpers.wait(10, function() {
            return test.done();
          });
        });
      });
    });
  };

  exports.init = function(test) {
    return gimmeEnv(function(lwebs, s, c, done) {
      return done(test);
    });
  };

  exports.ClientSend = function(test) {
    return gimmeEnv(function(lwebs, s, c, done) {
      var cnt;
      s.verbose = true;
      c.verbose = true;
      cnt = 0;
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
      s.verbose = true;
      c.verbose = true;
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
      s.addProtocol(new query.server({
        verbose: true
      }));
      c.addProtocol(new query.client({
        verbose: true
      }));
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
      s.addProtocol(new query.server({
        verbose: true
      }));
      c.addProtocol(new query.client({
        verbose: true
      }));
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
    var channel, query;
    channel = require('./protocols/channel');
    query = require('./protocols/query');
    return gimmeEnv(function(lwebs, s, c, done) {
      s.addProtocol(new query.server({
        verbose: true
      }));
      c.addProtocol(new query.client({
        verbose: true
      }));
      s.addProtocol(new channel.server({
        verbose: true
      }));
      c.addProtocol(new channel.client({
        verbose: true
      }));
      c.join('testchannel', function(msg) {
        test.equal(msg.bla, 3, "bla isn't 3. BLA ISN'T 3 MAN!!!");
        return c.channels.testchannel.part();
      });
      return helpers.wait(50, function() {
        s.channels.testchannel.broadcast({
          test: 2,
          bla: 3
        });
        return helpers.wait(50, function() {
          s.channelServer.channel('testchannel').broadcast({
            test: 1,
            bla: 2
          });
          return helpers.wait(25, function() {
            return done(test);
          });
        });
      });
    });
  };

  exports.queryServerServer = function(test) {
    return gimmeEnv(function(lwebs, s, c, done) {
      var query;
      query = require('./protocols/query');
      s.verbose = true;
      c.verbose = true;
      lwebs.addProtocol(new query.serverServer({
        verbose: true
      }));
      lwebs.onQuery({
        bla: Number
      }, function(msg, reply, realm) {
        console.log("SERVERQUERY", msg);
        return reply.end({
          bla: 666
        });
      });
      c.addProtocol(new query.client({
        verbose: true
      }));
      return c.query({
        bla: 3
      }, function(reply, end) {
        test.equal(end, true);
        test.deepEqual(reply, {
          bla: 666
        });
        return done(test);
      });
    });
  };

  exports.CollectionProtocol = function(test) {
    var channel, collectionProtocol, collectionsC, collectionsS, mongodb, query;
    mongodb = require('mongodb');
    channel = require('./protocols/channel');
    query = require('./protocols/query');
    collectionProtocol = require('./protocols/collection');
    collectionsS = require('collections/serverside');
    collectionsC = require('collections');
    return gimmeEnv(function(lwebs, s, c, done) {
      return helpers.wait(100, function() {
        var db;
        db = new mongodb.Db('testdb', new mongodb.Server('localhost', 27017), {
          safe: true
        });
        return db.open(function(err, data) {
          var clientC, clientM, mongoCollection, serverC, serverM, x;
          if (err) {
            test.fail(err);
          }
          s.addProtocol(new query.server({
            verbose: true
          }));
          s.addProtocol(new channel.server({
            verbose: true
          }));
          s.addProtocol(new collectionProtocol.server({
            verbose: true
          }));
          c.addProtocol(new query.client({
            verbose: true
          }));
          c.addProtocol(new channel.client({
            verbose: true
          }));
          c.addProtocol(new collectionProtocol.client({
            verbose: true,
            collectionClass: collectionsC.ModelMixin.extend4000(collectionsC.ReferenceMixin, collectionProtocol.clientCollection)
          }));
          mongoCollection = new collectionsS.MongoCollection({
            collection: 'bla',
            db: db
          });
          serverM = mongoCollection.defineModel('bla', {
            permissions: collectionsS.definePermissions(function(write, execute, read) {
              return write('test', new collectionsS.Permission());
            })
          });
          serverC = s.collection('bla', {
            collection: mongoCollection,
            broadcast: '*'
          });
          clientC = c.collection('bla');
          clientM = clientC.defineModel('bla', {});
          x = new clientM({
            test: 'data'
          });
          return x.flush(function(err, data) {
            if (err) {
              test.error(err);
            }
            return x.remove(function() {
              return test.done();
            });
          });
        });
      });
    });
  };

  exports.CollectionProtocolPermissions = function(test) {
    var channel, collectionProtocol, collectionsC, collectionsS, mongodb, query;
    mongodb = require('mongodb');
    channel = require('./protocols/channel');
    query = require('./protocols/query');
    collectionProtocol = require('./protocols/collection');
    collectionsS = require('collections/serverside');
    collectionsC = require('collections');
    return gimmeEnv(function(lwebs, s, c, done) {
      return helpers.wait(100, function() {
        var db;
        db = new mongodb.Db('testdb', new mongodb.Server('localhost', 27017), {
          safe: true
        });
        return db.open(function(err, data) {
          var clientC, clientM, mongoCollection, serverC, serverM, x;
          if (err) {
            test.fail(err);
          }
          s.addProtocol(new query.server({
            verbose: true
          }));
          s.addProtocol(new channel.server({
            verbose: true
          }));
          s.addProtocol(new collectionProtocol.server({
            verbose: true
          }));
          c.addProtocol(new query.client({
            verbose: true
          }));
          c.addProtocol(new channel.client({
            verbose: true
          }));
          c.addProtocol(new collectionProtocol.client({
            verbose: true,
            collectionClass: collectionsC.ModelMixin.extend4000(collectionsC.ReferenceMixin, collectionProtocol.clientCollection)
          }));
          mongoCollection = new collectionsS.MongoCollection({
            collection: 'bla',
            db: db
          });
          serverM = mongoCollection.defineModel('bla', {
            permissions: collectionsS.definePermissions(function(write, execute, read) {
              return write('test', new collectionsS.Permission());
            })
          });
          serverC = s.collection('bla', {
            collection: mongoCollection,
            broadcast: '*',
            permissions: function(perm) {
              return perm.create(true);
            }
          });
          clientC = c.collection('bla');
          clientM = clientC.defineModel('bla', {});
          x = new clientM({
            test: 'data'
          });
          return x.flush(function(err, data) {
            if (err) {
              test.error(err);
            }
            return x.remove(function(err, data) {
              if (!err) {
                test.eror('remove passed');
              }
              serverC.permissions.push({
                matchMsg: v(true)
              });
              return x.remove(function(err, data) {
                if (err) {
                  test.error('remove didnt pass');
                }
                return test.done();
              });
            });
          });
        });
      });
    });
  };

  Test = (function() {
    function Test() {}

    Test.prototype.done = function() {
      console.log('test done');
      return process.exit(0);
    };

    Test.prototype.error = function(err) {
      console.log('ERROR', err);
      return process.exit(0);
    };

    Test.prototype.equal = function(x, y) {
      if (x !== y) {
        throw "not equal";
      }
    };

    Test.prototype.deepEqual = function() {
      return true;
    };

    Test.prototype.ok = function() {
      return true;
    };

    return Test;

  })();

  exports.CollectionProtocolPermissions(new Test());

}).call(this);
