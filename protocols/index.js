(function(){
  var path, autoIndex, out$ = typeof exports != 'undefined' && exports || this;
  path = require('path');
  autoIndex = require('autoIndex');
  import$(out$, autoIndex(path.resolve(__dirname) + "/index.ls", new RegExp(/js$/)));
  function import$(obj, src){
    var own = {}.hasOwnProperty;
    for (var key in src) if (own.call(src, key)) obj[key] = src[key];
    return obj;
  }
}).call(this);
