(function(){
  var net, p, core, tcpClient, out$ = typeof exports != 'undefined' && exports || this;
  net = require('net');
  p = require('bluebird');
  core = require('../../core');
  import$(module.exports, require('../tcp'));
  out$.tcpClient = tcpClient = exports.tcpSocketChannel.extend4000({
    defaults: {
      name: 'tcpClient'
    },
    initialize: function(){
      return this.set({
        socket: new net.Socket()
      });
    },
    connect: function(opts, cb){
      var this$ = this;
      return new p(function(resolve, reject){
        var opts, ref$, ref1$, errListener;
        opts = import$((ref1$ = {}, ref1$.host = (ref$ = this$.attributes).host, ref1$.port = ref$.port, ref1$), opts);
        errListener = function(it){
          this$.end();
          return reject(it);
        };
        this$.socket.on('error', errListener);
        return this$.socket.connect(opts, function(){
          this$.socket.removeListener('error', errListener);
          return resolve();
        });
      });
    }
  });
  function import$(obj, src){
    var own = {}.hasOwnProperty;
    for (var key in src) if (own.call(src, key)) obj[key] = src[key];
    return obj;
  }
}).call(this);
