(function(){
  var _, Backbone, subscriptionMan, core, helpers, util, cluster, validator, v, out$ = typeof exports != 'undefined' && exports || this, slice$ = [].slice;
  _ = require('underscore');
  Backbone = require('backbone4000');
  subscriptionMan = require('subscriptionman2');
  core = require('../core');
  helpers = require('helpers');
  util = require('util');
  cluster = require('cluster');
  validator = require('validator2-extras');
  v = validator.v;
  out$.clusterChannel = core.channel.extend4000({
    initialize: function(){
      return process.on('message', partialize$.apply(this, [this.event, [void 8, this.realm], [0]]));
    },
    send: function(msg){
      return process.send(msg);
    }
  });
  function partialize$(f, args, where){
    var context = this;
    return function(){
      var params = slice$.call(arguments), i,
          len = params.length, wlen = where.length,
          ta = args ? args.concat() : [], tw = where ? where.concat() : [];
      for(i = 0; i < len; ++i) { ta[tw[0]] = params[i]; tw.shift(); }
      return len < wlen && len ?
        partialize$.apply(context, [f, ta, tw]) : f.apply(context, ta);
    };
  }
}).call(this);
