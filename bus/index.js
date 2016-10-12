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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2xlc2gvY29kaW5nL3Jlc2JvdS9jb3JlL25vZGVfbW9kdWxlcy9sd2ViMy9idXMvaW5kZXgubHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7RUFFVyxJQUFBLENBQUEsQ0FBQSxDQUFBLE9BQUEsQ0FBQSxNQUFBO0VBQU0sU0FBQSxDQUFBLENBQUEsQ0FBQSxPQUFBLENBQUEsV0FBQTtnQkFFVixVQUNMLElBQUksQ0FBQyxPQUFtQixDQUFYLFNBQUQsQ0FBWSxDQUFBLENBQUEsQ0FBYSxpQkFDakMsT0FBTyxLQUFBLENBRFgiLCJzb3VyY2VzQ29udGVudCI6WyIjIGF1dG9jb21waWxlXG5cbnJlcXVpcmUhIHsgcGF0aCwgYXV0b0luZGV4IH1cbiAgXG5leHBvcnQgYXV0b0luZGV4IGRvXG4gIHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUpICsgXCIvaW5kZXgubHNcIlxuICBuZXcgUmVnRXhwIC9qcyQvXG5cbiJdfQ==
