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
  import$(out$, autoIndex(__dirname, {
    ignore: new RegExp(/js$/)
  }));
  function import$(obj, src){
    var own = {}.hasOwnProperty;
    for (var key in src) if (own.call(src, key)) obj[key] = src[key];
    return obj;
  }
}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2xlc2gvY29kaW5nL3Jlc2JvdS9zZXJ2ZXJzaWRlL25vZGVfbW9kdWxlcy9sd2ViMy9idXMvaW5kZXgubHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7RUFFYyxPQUFaLENBQUEsQ0FBQSxDQUFBLE9BQUEsQ0FBQSxVQUFBLENBQUEsQ0FBWTtFQUVXLFFBQXZCLENBQUEsQ0FBQSxDQUFBLE9BQUEsQ0FBQSxxQkFBQTtFQUNrQixNQUFsQixDQUFBLENBQUEsQ0FBQSxPQUFBLENBQUEsa0JBQUE7RUFFQSxJQUFBLENBQUEsQ0FBQSxDQUFBLE9BQUEsQ0FBQSxNQUFBO0VBQ0EsU0FBQSxDQUFBLENBQUEsQ0FBQSxPQUFBLENBQUEsV0FBQTtFQUVVLENBQVYsQ0FBQSxDQUFBLENBQUEsT0FBQSxDQUFBLFVBQUE7RUFFVyxJQUFYLENBQUEsQ0FBQSxDQUFBLE9BQUEsQ0FBQSxTQUFBO0VBSUYsR0FBSSxDQUFBLENBQUEsQ0FBRSxRQUFRLENBQUMsTUFBTSxDQUFDLFdBRXBCO0lBQUEsWUFBWSxRQUFBLENBQUEsSUFBQTtNQUFDLElBQUMsQ0FBQTtNQUNaLElBQUMsQ0FBQSxHQUFHLFVBQVUsUUFBQSxDQUFBLEVBQUE7ZUFBRyxPQUFPLEVBQUE7T0FBcEI7YUFDSixJQUFDLENBQUEsR0FBRyxVQUFVLFFBQUEsQ0FBQSxFQUFBO2VBQUcsU0FBUyxFQUFBO09BQXRCOztJQUVOLE1BQU0sUUFBQSxDQUFBOztNQUFJLDBGQUFTO01BQ2pCLE1BQUEsc0JBQUE7O0lBRUYsUUFBUSxRQUFBLENBQUE7O01BQUk7aUJBQWdCLEVBQUUsUUFBQSxDQUFBLE9BQUEsRUFBQSxNQUFBOztRQUM1QixPQUFRLENBQUEsQ0FBQSxDQUFFLFFBQVEsT0FBQTtRQUNsQixNQUFBLHNCQUFBO09BRjRCOztFQVA5QixDQUFBO2dCQVdLLFVBQ0wsV0FDQTtJQUFBLFlBQVksT0FBTyxLQUFBO0VBQW5CLENBREEiLCJzb3VyY2VzQ29udGVudCI6WyIjIGF1dG9jb21waWxlXG5yZXF1aXJlISB7XG4gIGxlc2hkYXNoOiB7IGZsYXR0ZW4gfVxuICBcbiAgJ2JhY2tib25lNDAwMC9leHRyYXMnOiBCYWNrYm9uZVxuICBzdWJzY3JpcHRpb25tYW4yOiBzdWJNYW5cbiAgXG4gIHBhdGhcbiAgYXV0b0luZGV4XG4gIFxuICBibHVlYmlyZDogcFxuICBcbiAgJy4uL2NvcmUnOiBjb3JlXG59XG4gIFxuXG5CdXMgPSBCYWNrYm9uZS5UYWdnZWQuZXh0ZW5kNDAwMCBkb1xuXG4gIGluaXRpYWxpemU6IChAb3B0cykgLT5cbiAgICBAb24gJ2FkZFRhZycsIC0+IGxpc3RlbiBpdFxuICAgIEBvbiAnZGVsVGFnJywgLT4gdW5saXN0ZW4gaXRcbiAgXG4gIHNlbmQ6ICguLi5hZGRyZXNzLCBtZXNzYWdlKSAtPlxuICAgIC4uLlxuXG4gIGxpc3RlbjogKC4uLmFkZHJlc3MpIC0+IG5ldyBwIChyZXNvbHZlLHJlamVjdCkgfj4gXG4gICAgYWRkcmVzcyA9IGZsYXR0ZW4gYWRkcmVzc1xuICAgIC4uLlxuXG5leHBvcnQgYXV0b0luZGV4IGRvXG4gIF9fZGlybmFtZVxuICBpZ25vcmU6IG5ldyBSZWdFeHAgL2pzJC9cbiJdfQ==
