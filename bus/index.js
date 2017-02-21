(function(){
  var flatten, Backbone, subMan, path, autoIndex, p, core, Bus, slice$ = [].slice, out$ = typeof exports != 'undefined' && exports || this;
  flatten = require('leshdash').flatten;
  Backbone = require('backbone4000/extras');
  subMan = require('subscriptionman2');
  path = require('path');
  autoIndex = require('autoIndex');
  p = require('bluebird');
  core = require('../core');
  Bus = Backbone.Tagged.extend4000({
    initialize: function(opts){
      this.opts = opts;
      this.on('addTag', function(it){
        return listen(it);
      });
      return this.on('delTag', function(it){
        return unlisten(it);
      });
    },
    send: function(){
      var i$, address, message;
      address = 0 < (i$ = arguments.length - 1) ? slice$.call(arguments, 0, i$) : (i$ = 0, []), message = arguments[i$];
      throw Error('unimplemented');
    },
    listen: function(){
      var address, this$ = this;
      address = slice$.call(arguments);
      return new p(function(resolve, reject){
        var address;
        address = flatten(address);
        throw Error('unimplemented');
      });
    }
  });
  import$(out$, autoIndex(__dirname, new RegExp(/js$/)));
  function import$(obj, src){
    var own = {}.hasOwnProperty;
    for (var key in src) if (own.call(src, key)) obj[key] = src[key];
    return obj;
  }
}).call(this);
