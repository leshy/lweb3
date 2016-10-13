(function(){
  var net, core, tcpClient, out$ = typeof exports != 'undefined' && exports || this;
  net = require('net');
  core = require('../../core');
  import$(module.exports, require('../tcp'));
  out$.tcpClient = tcpClient = exports.tcpSocketChannel.extend4000({
    defaults: {
      name: 'tcpClient'
    },
    initialize: function(){
      return this.set({
        socket: this.socket = new net.Socket()
      });
    },
    connect: function(opts, cb){
      var ref$, ref1$, err;
      opts = import$((ref1$ = {}, ref1$.host = (ref$ = this.attributes).host, ref1$.port = ref$.port, ref1$), opts);
      try {
        this.socket.connect(opts);
      } catch (e$) {
        err = e$;
        cb(err);
      }
      return this.socket.once('connect', cb);
    }
  });
  function import$(obj, src){
    var own = {}.hasOwnProperty;
    for (var key in src) if (own.call(src, key)) obj[key] = src[key];
    return obj;
  }
}).call(this);
