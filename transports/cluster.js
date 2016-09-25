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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2xlc2gvY29kaW5nL3Jlc2JvdS9jb3JlL25vZGVfbW9kdWxlcy9sd2ViMy90cmFuc3BvcnRzL2NsdXN0ZXIubHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7RUFHYyxDQUFaLENBQUEsQ0FBQSxDQUFBLE9BQUEsQ0FBQSxZQUFBO0VBQ2MsUUFBZCxDQUFBLENBQUEsQ0FBQSxPQUFBLENBQUEsY0FBQTtFQUNrQixlQUFsQixDQUFBLENBQUEsQ0FBQSxPQUFBLENBQUEsa0JBQUE7RUFDQSxJQUFBLENBQUEsQ0FBQSxDQUFBLE9BQUEsQ0FBQSxTQUFBO0VBQ0EsT0FBQSxDQUFBLENBQUEsQ0FBQSxPQUFBLENBQUEsU0FBQTtFQUNBLElBQUEsQ0FBQSxDQUFBLENBQUEsT0FBQSxDQUFBLE1BQUE7RUFDQSxPQUFBLENBQUEsQ0FBQSxDQUFBLE9BQUEsQ0FBQSxTQUFBO0VBR0YsU0FBVSxDQUFBLENBQUEsQ0FBRSxRQUFRLG1CQUFEO0VBQXVCLENBQUUsQ0FBQSxDQUFBLENBQUUsU0FBUyxDQUFDO09BR3RELGlCQUFnQixJQUFJLENBQUMsT0FBTyxDQUFDLFdBQzNCO0lBQUEsWUFBWSxRQUFBLENBQUE7YUFBRyxPQUFPLENBQUMsR0FBRyw2QkFBWSxPQUFBLElBQUMsQ0FBQSxnQkFBUyxJQUFDLENBQUEsYUFBdkI7O0lBQzFCLE1BQU0sUUFBQSxDQUFBLEdBQUE7YUFBUyxPQUFPLENBQUMsS0FBSyxHQUFBOztFQUQ1QixDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiIyBhdXRvY29tcGlsZVxuXG5yZXF1aXJlISB7IFxuICB1bmRlcnNjb3JlOiBfXG4gIGJhY2tib25lNDAwMDogQmFja2JvbmVcbiAgc3Vic2NyaXB0aW9ubWFuMjogc3Vic2NyaXB0aW9uTWFuXG4gICcuLi9jb3JlJ1xuICBoZWxwZXJzXG4gIHV0aWxcbiAgY2x1c3RlclxufVxuXG52YWxpZGF0b3IgPSByZXF1aXJlKCd2YWxpZGF0b3IyLWV4dHJhcycpOyB2ID0gdmFsaWRhdG9yLnZcblxuZXhwb3J0XG4gIGNsdXN0ZXJDaGFubmVsOiBjb3JlLmNoYW5uZWwuZXh0ZW5kNDAwMCBkb1xuICAgIGluaXRpYWxpemU6IC0+IHByb2Nlc3Mub24gJ21lc3NhZ2UnLCAoQGV2ZW50IF8sIEByZWFsbSlcbiAgICBzZW5kOiAobXNnKSAtPiBwcm9jZXNzLnNlbmQgbXNnXG4iXX0=
