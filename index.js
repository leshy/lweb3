(function(){
  var out$ = typeof exports != 'undefined' && exports || this;
  import$(out$, require('./core'));
  out$.protocols = require('./protocols');
  out$.bus = require('./bus');
  function import$(obj, src){
    var own = {}.hasOwnProperty;
    for (var key in src) if (own.call(src, key)) obj[key] = src[key];
    return obj;
  }
}).call(this);
