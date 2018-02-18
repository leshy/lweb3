(function(){
  var path, autoIndex, out$ = typeof exports != 'undefined' && exports || this;
  path = require('path');
  autoIndex = require('autoIndex');
  import$(out$, autoIndex(__dirname, {
    ignore: new RegExp(/js$/)
  }));
  function import$(obj, src){
    var own = {}.hasOwnProperty;
    for (var key in src) if (own.call(src, key)) obj[key] = src[key];
    return obj;
  }
}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2xlc2gvY29kaW5nL3Jlc2JvdS9zZXJ2ZXJzaWRlL25vZGVfbW9kdWxlcy9sd2ViMy9wcm90b2NvbHMvaW5kZXgubHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7RUFFRSxJQUFBLENBQUEsQ0FBQSxDQUFBLE9BQUEsQ0FBQSxNQUFBO0VBQ0EsU0FBQSxDQUFBLENBQUEsQ0FBQSxPQUFBLENBQUEsV0FBQTtnQkFHSyxVQUNMLFdBQ0E7SUFBQSxZQUFZLE9BQU8sS0FBQTtFQUFuQixDQURBIiwic291cmNlc0NvbnRlbnQiOlsiIyBhdXRvY29tcGlsZVxucmVxdWlyZSEge1xuICBwYXRoXG4gIGF1dG9JbmRleFxufVxuICBcbmV4cG9ydCBhdXRvSW5kZXggZG9cbiAgX19kaXJuYW1lXG4gIGlnbm9yZTogbmV3IFJlZ0V4cCAvanMkL1xuIl19
